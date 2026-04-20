const { AppError } = require("../errors/app-error");

function criarUsuario(dados) {
  if (!dados.nome && !dados.email) {
    throw new AppError("Usuario precisa ter nome ou email.", 422, "USUARIO_INVALIDO");
  }

  if (!dados.nivel_acesso) {
    throw new AppError("Nivel de acesso e obrigatorio.", 422, "NIVEL_ACESSO_INVALIDO");
  }

  return {
    id: dados.id,
    nome: dados.nome || "Usuario",
    email: dados.email,
    nivel_acesso: dados.nivel_acesso,
    clinica_id: dados.clinica_id ?? null,
    status: dados.status || "ativo",
  };
}

module.exports = { criarUsuario };
