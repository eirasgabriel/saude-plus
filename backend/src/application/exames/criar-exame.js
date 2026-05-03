const { criarExame } = require("../../domain/entities/exame");
const { AppError } = require("../../domain/errors/app-error");
const { verificarConflitoAgenda } = require("../agenda/conflitos-agenda");

function notificarExameAgendado(pushNotifications, exame) {
  if (!pushNotifications?.enviarParaUsuario) return;

  pushNotifications
    .enviarParaUsuario(exame.paciente_id, {
      title: "Exame agendado",
      body: `Seu exame ${exame.tipo} foi marcado para ${exame.data} as ${exame.horario}.`,
      url: "/paciente/exames",
      tag: `exame-${exame.id || exame.agenda_id || exame.tipo}`,
    })
    .catch((erro) => {
      console.warn("Nao foi possivel enviar push de exame:", erro.message);
    });
}

function criarCriarExame({
  agendaRepository,
  consultaRepository,
  exameRepository,
  usuarioRepository,
  pushNotifications,
}) {
  return async function criarNovoExame(dados) {
    const exame = criarExame(dados);
    const paciente = await usuarioRepository.buscarPorId(exame.paciente_id);

    if (!paciente || paciente.nivel_acesso !== "paciente") {
      throw new AppError("Paciente nao cadastrado.", 422, "PACIENTE_NAO_CADASTRADO");
    }

    let medico = null;
    if (exame.medico_id != null) {
      medico = await usuarioRepository.buscarPorId(exame.medico_id);
      if (
        !medico ||
        medico.nivel_acesso !== "medico" ||
        medico.status === "inativo" ||
        Number(medico.clinica_id) !== Number(exame.clinica_id)
      ) {
        throw new AppError("Medico nao cadastrado na clinica.", 422, "MEDICO_NAO_CADASTRADO");
      }
    }

    if (exame.agenda_id && exame.medico_id != null) {
      const disponibilidade = await agendaRepository.verificarDisponibilidade({
        agendaId: exame.agenda_id,
        medicoId: exame.medico_id,
        especialidade: exame.tipo,
      });

      if (!disponibilidade.disponivel) {
        throw new AppError(
          "Este horario nao esta mais disponivel. Por favor, escolha outro.",
          409,
          "HORARIO_INDISPONIVEL"
        );
      }

      const horarioOcupado = await verificarConflitoAgenda({
        consultaRepository,
        exameRepository,
        clinicaId: exame.clinica_id,
        medicoId: exame.medico_id,
        agendaId: exame.agenda_id,
        data: exame.data,
        horario: exame.horario,
      });

      if (horarioOcupado) {
        throw new AppError(
          "Este medico ja possui consulta ou exame neste horario.",
          409,
          "HORARIO_DUPLICADO"
        );
      }

      await agendaRepository.reservar(exame.agenda_id);
    }

    exame.paciente = paciente.nome;
    exame.medico = medico?.nome || exame.medico || "";

    const exameCriado = await exameRepository.criar(exame);
    notificarExameAgendado(pushNotifications, exameCriado);

    return exameCriado;
  };
}

module.exports = { criarCriarExame };
