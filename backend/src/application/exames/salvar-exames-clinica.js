function criarSalvarExamesClinica({ exameRepository }) {
  return async function salvarExamesClinica({ clinicaId, exames }) {
    if (!clinicaId) return [];
    const lista = Array.isArray(exames) ? exames : [];
    return exameRepository.substituirPorClinica(clinicaId, lista);
  };
}

module.exports = { criarSalvarExamesClinica };
