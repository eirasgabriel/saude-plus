const { criarConsulta } = require("../../domain/entities/consulta");
const { AppError } = require("../../domain/errors/app-error");
const { verificarConflitoAgenda } = require("../agenda/conflitos-agenda");

function criarCriarConsulta({ agendaRepository, consultaRepository, exameRepository, usuarioRepository }) {
  return async function criarNovaConsulta(dados) {
    const consulta = criarConsulta(dados);
    const paciente = await usuarioRepository.buscarPorId(consulta.paciente_id);

    if (!paciente || paciente.nivel_acesso !== "paciente") {
      throw new AppError("Paciente nao cadastrado.", 422, "PACIENTE_NAO_CADASTRADO");
    }

    const medico = await usuarioRepository.buscarPorId(consulta.medico_id);
    if (
      !medico ||
      medico.nivel_acesso !== "medico" ||
      medico.status === "inativo" ||
      Number(medico.clinica_id) !== Number(consulta.clinica_id)
    ) {
      throw new AppError("Medico nao cadastrado na clinica.", 422, "MEDICO_NAO_CADASTRADO");
    }

    const disponibilidade = await agendaRepository.verificarDisponibilidade({
      agendaId: consulta.agenda_id,
      medicoId: consulta.medico_id,
      especialidade: consulta.especialidade,
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
      clinicaId: consulta.clinica_id,
      medicoId: consulta.medico_id,
      agendaId: consulta.agenda_id,
      data: consulta.data,
      horario: consulta.horario,
    });

    if (horarioOcupado) {
      throw new AppError(
        "Este medico ja possui consulta ou exame neste horario.",
        409,
        "HORARIO_DUPLICADO"
      );
    }

    await agendaRepository.reservar(consulta.agenda_id);
    consulta.paciente = paciente.nome;
    consulta.medico = medico.nome;
    const consultaCriada = await consultaRepository.criar(consulta);

    return { consulta: consultaCriada };
  };
}

module.exports = { criarCriarConsulta };
