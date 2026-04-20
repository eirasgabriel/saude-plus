function criarListarClinicas({ clinicaRepository }) {
  return async function listarClinicas() {
    return clinicaRepository.listar();
  };
}

module.exports = { criarListarClinicas };
