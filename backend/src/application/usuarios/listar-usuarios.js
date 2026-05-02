const { NIVEIS_ACESSO } = require("../../domain/value-objects/niveis-acesso");

function criarListarUsuarios({ usuarioRepository }) {
  return async function listarUsuarios(contexto = {}) {
    const usuarios = await usuarioRepository.listar();
    const usuarioAtual = contexto.usuario;

    if (usuarioAtual?.nivel_acesso === NIVEIS_ACESSO.ADMIN_MASTER) {
      return usuarios;
    }

    if (
      [NIVEIS_ACESSO.ADMIN_CLINICA, NIVEIS_ACESSO.MEDICO].includes(usuarioAtual?.nivel_acesso)
    ) {
      return usuarios.filter(
        (usuario) =>
          usuario.nivel_acesso === NIVEIS_ACESSO.PACIENTE ||
          Number(usuario.clinica_id) === Number(usuarioAtual.clinica_id)
      );
    }

    return usuarios.filter((usuario) => Number(usuario.id) === Number(usuarioAtual?.id));
  };
}

module.exports = { criarListarUsuarios };
