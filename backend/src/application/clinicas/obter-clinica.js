const { AppError } = require("../../domain/errors/app-error");

function criarObterClinica({ clinicaRepository }) {
  return async function obterClinica(id) {
    const clinica = await clinicaRepository.buscarPorId(id);

    if (!clinica) {
      throw new AppError("Clinica nao encontrada.", 404, "CLINICA_NAO_ENCONTRADA");
    }

    return clinica;
  };
}

module.exports = { criarObterClinica };
