const { AppError } = require("../../domain/errors/app-error");

function criarSalvarUsuario({ usuarioRepository }) {
  return async function salvarUsuario(dados) {
    if (!dados.nome || !dados.email || !dados.nivel_acesso) {
      throw new AppError("Nome, email e nivel de acesso sao obrigatorios.", 422, "USUARIO_INVALIDO");
    }

    const email = dados.email.trim();
    const usuarioComMesmoEmail = await usuarioRepository.buscarPorEmail(email);

    if (
      usuarioComMesmoEmail &&
      (!dados.id || Number(usuarioComMesmoEmail.id) !== Number(dados.id))
    ) {
      throw new AppError("Ja existe um usuario cadastrado com este email.", 409, "EMAIL_DUPLICADO");
    }

    const payload = {
      nome: dados.nome.trim(),
      email,
      nivel_acesso: dados.nivel_acesso,
      clinica_id: dados.clinica_id ? Number(dados.clinica_id) : null,
      status: dados.status || "ativo",
    };

    if (dados.cpf) {
      payload.cpf = String(dados.cpf).replace(/\D/g, "");
    }

    if (dados.telefone) {
      payload.telefone = String(dados.telefone).replace(/\D/g, "");
    }

    if (dados.senha) {
      payload.senha = String(dados.senha);
    }

    if (dados.id) {
      const usuario = await usuarioRepository.atualizar(dados.id, payload);
      if (!usuario) {
        throw new AppError("Usuario nao encontrado.", 404, "USUARIO_NAO_ENCONTRADO");
      }
      return usuario;
    }

    return usuarioRepository.salvar(payload);
  };
}

module.exports = { criarSalvarUsuario };
