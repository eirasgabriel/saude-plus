function criarListarUsuarios({ usuarioRepository }) {
  return async function listarUsuarios() {
    return usuarioRepository.listar();
  };
}

module.exports = { criarListarUsuarios };
