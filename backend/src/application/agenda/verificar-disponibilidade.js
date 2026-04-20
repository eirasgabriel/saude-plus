function criarVerificarDisponibilidade({ agendaRepository }) {
  return async function verificarDisponibilidade({ agendaId, medicoId, especialidade = "" }) {
    return agendaRepository.verificarDisponibilidade({
      agendaId,
      medicoId,
      especialidade,
    });
  };
}

module.exports = { criarVerificarDisponibilidade };
