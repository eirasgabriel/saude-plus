const { criarConsulta } = require("../../domain/entities/consulta");
const { AppError } = require("../../domain/errors/app-error");

function criarCriarConsulta({ agendaRepository, consultaRepository }) {
  return async function criarNovaConsulta(dados) {
    const consulta = criarConsulta(dados);
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

    await agendaRepository.reservar(consulta.agenda_id);
    const consultaCriada = await consultaRepository.criar(consulta);

    return { consulta: consultaCriada };
  };
}

module.exports = { criarCriarConsulta };
