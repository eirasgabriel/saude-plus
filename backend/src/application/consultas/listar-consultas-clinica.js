function criarListarConsultasClinica({ consultaRepository }) {
  return async function listarConsultasClinica(clinicaId) {
    if (!clinicaId) return [];
    return consultaRepository.listarPorClinica(clinicaId);
  };
}

module.exports = { criarListarConsultasClinica };
