const { AppError } = require("../../domain/errors/app-error");

function texto(valor, campo, opcoes = {}) {
  const conteudo = String(valor || "").trim();
  const min = opcoes.min ?? 1;
  const max = opcoes.max ?? 255;

  if (conteudo.length < min) {
    throw new AppError(`${campo} invalido.`, 422, "VALIDACAO_INVALIDA");
  }

  if (conteudo.length > max) {
    throw new AppError(`${campo} excede ${max} caracteres.`, 422, "VALIDACAO_INVALIDA");
  }

  return conteudo;
}

function email(valor) {
  const normalizado = texto(valor, "Email", { min: 5, max: 254 }).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizado)) {
    throw new AppError("Email invalido.", 422, "EMAIL_INVALIDO");
  }

  return normalizado;
}

function senha(valor) {
  const conteudo = String(valor || "");

  if (conteudo.length < 8) {
    throw new AppError("A senha deve ter pelo menos 8 caracteres.", 422, "SENHA_INVALIDA");
  }

  if (conteudo.length > 128) {
    throw new AppError("A senha excede o tamanho permitido.", 422, "SENHA_INVALIDA");
  }

  return conteudo;
}

function inteiroPositivo(valor, campo, obrigatorio = true) {
  if ((valor == null || valor === "") && !obrigatorio) return null;
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError(`${campo} invalido.`, 422, "VALIDACAO_INVALIDA");
  }

  return numero;
}

module.exports = { email, inteiroPositivo, senha, texto };
