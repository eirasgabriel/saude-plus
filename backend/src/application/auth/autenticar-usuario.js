const { AppError } = require("../../domain/errors/app-error");
const { verificarSenha } = require("../../infrastructure/security/passwords");
const { gerarTokenSessao } = require("../../infrastructure/security/tokens");
const validar = require("../../infrastructure/security/validacao");

function criarAutenticarUsuario({ usuarioRepository, env }) {
  return async function autenticarUsuario({ email, senha }) {
    const emailNormalizado = validar.email(email);
    const senhaNormalizada = String(senha || "");

    if (!senhaNormalizada) {
      throw new AppError("Email e senha sao obrigatorios.", 400, "CREDENCIAIS_OBRIGATORIAS");
    }

    const usuario = await usuarioRepository.buscarPorEmail(emailNormalizado);

    if (!usuario || !verificarSenha(senhaNormalizada, usuario.senha_hash) || usuario.status !== "ativo") {
      throw new AppError("Email ou senha incorretos.", 401, "CREDENCIAIS_INVALIDAS");
    }

    const { senha: _senha, senha_hash: _senhaHash, ...usuarioSeguro } = usuario;

    return {
      usuario: usuarioSeguro,
      token: gerarTokenSessao(usuario, {
        jwtSecret: env.jwtSecret,
        ttlSegundos: env.tokenTtlSegundos,
      }),
    };
  };
}

module.exports = { criarAutenticarUsuario };
