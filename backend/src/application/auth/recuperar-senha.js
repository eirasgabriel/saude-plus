const validar = require("../../infrastructure/security/validacao");

function criarRecuperarSenha({ usuarioRepository, env }) {
  return async function recuperarSenha({ email, novaSenha, codigoRecuperacao }) {
    const emailNormalizado = validar.email(email);
    const senhaNormalizada = validar.senha(novaSenha);
    const segredoRecuperacao = env.recoverySecret;

    if (!segredoRecuperacao || codigoRecuperacao !== segredoRecuperacao) {
      return {
        mensagem:
          "Se o email estiver cadastrado, as instrucoes de recuperacao serao enviadas pelo canal configurado.",
      };
    }

    const usuario = await usuarioRepository.buscarPorEmail(emailNormalizado);
    if (!usuario) {
      return {
        mensagem:
          "Se o email estiver cadastrado, as instrucoes de recuperacao serao enviadas pelo canal configurado.",
      };
    }

    await usuarioRepository.atualizar(usuario.id, { senha: senhaNormalizada });

    return {
      mensagem: "Senha atualizada com sucesso. Use a nova senha para entrar.",
    };
  };
}

module.exports = { criarRecuperarSenha };
