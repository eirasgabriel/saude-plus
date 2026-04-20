function criarCancelarConsulta({ consultaRepository }) {
  return async function cancelarConsulta({ consultaId, motivo }) {
    return consultaRepository.cancelar(consultaId, motivo);
  };
}

module.exports = { criarCancelarConsulta };
