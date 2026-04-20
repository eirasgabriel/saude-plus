function criarListarConsultasPaciente({ consultaRepository }) {
  return async function listarConsultasPaciente(pacienteId) {
    if (!pacienteId) return [];
    return consultaRepository.listarPorPaciente(pacienteId);
  };
}

module.exports = { criarListarConsultasPaciente };
