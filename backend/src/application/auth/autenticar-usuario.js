const { AppError } = require("../../domain/errors/app-error");

function criarAutenticarUsuario({ usuarioRepository }) {
  return async function autenticarUsuario({ email, senha }) {
    if (!email || !senha) {
      throw new AppError("Email e senha sao obrigatorios.", 400, "CREDENCIAIS_OBRIGATORIAS");
    }

    const usuario = await usuarioRepository.buscarPorEmail(email);

    if (!usuario || usuario.senha !== senha || usuario.status !== "ativo") {
      throw new AppError("Email ou senha incorretos.", 401, "CREDENCIAIS_INVALIDAS");
    }

    const { senha: _senha, ...usuarioSeguro } = usuario;

    return {
      usuario: usuarioSeguro,
      token: `dev-token-${usuario.id}`,
    };
  };
}

module.exports = { criarAutenticarUsuario };
