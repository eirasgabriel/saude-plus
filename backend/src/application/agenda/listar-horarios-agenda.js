const { AppError } = require("../../domain/errors/app-error");

function criarListarHorariosAgenda({ agendaRepository }) {
  return async function listarHorariosAgenda({ clinicaId, data, medicoId = null, especialidade = "" }) {
    if (!clinicaId || !data) {
      throw new AppError("Parametros clinica e data sao obrigatorios.", 400, "AGENDA_PARAMETROS_INVALIDOS");
    }

    return agendaRepository.listarHorarios({
      clinicaId,
      data,
      medicoId,
      especialidade,
    });
  };
}

module.exports = { criarListarHorariosAgenda };
