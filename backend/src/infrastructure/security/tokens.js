const crypto = require("crypto");
const { AppError } = require("../../domain/errors/app-error");

function base64UrlJson(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function assinar(conteudo, secret) {
  return crypto.createHmac("sha256", secret).update(conteudo).digest("base64url");
}

function gerarTokenSessao(usuario, opcoes = {}) {
  const secret = opcoes.jwtSecret;
  if (!secret) {
    throw new AppError("JWT_SECRET nao configurado.", 500, "JWT_SECRET_AUSENTE");
  }

  const agora = Math.floor(Date.now() / 1000);
  const ttl = Number(opcoes.ttlSegundos || 60 * 60 * 8);
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlJson({
    sub: String(usuario.id),
    nivel_acesso: usuario.nivel_acesso,
    clinica_id: usuario.clinica_id ?? null,
    iat: agora,
    exp: agora + ttl,
  });
  const conteudo = `${header}.${payload}`;

  return `${conteudo}.${assinar(conteudo, secret)}`;
}

function verificarTokenSessao(token, opcoes = {}) {
  const secret = opcoes.jwtSecret;
  const partes = String(token || "").split(".");

  if (!secret || partes.length !== 3) {
    throw new AppError("Token invalido.", 401, "TOKEN_INVALIDO");
  }

  const [header, payload, assinatura] = partes;
  const conteudo = `${header}.${payload}`;
  const assinaturaEsperada = assinar(conteudo, secret);
  const assinaturaBuffer = Buffer.from(assinatura);
  const esperadaBuffer = Buffer.from(assinaturaEsperada);

  if (
    assinaturaBuffer.length !== esperadaBuffer.length ||
    !crypto.timingSafeEqual(assinaturaBuffer, esperadaBuffer)
  ) {
    throw new AppError("Token invalido.", 401, "TOKEN_INVALIDO");
  }

  let dados;
  try {
    dados = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new AppError("Token invalido.", 401, "TOKEN_INVALIDO");
  }

  if (!dados.exp || dados.exp < Math.floor(Date.now() / 1000)) {
    throw new AppError("Sessao expirada.", 401, "TOKEN_EXPIRADO");
  }

  return {
    id: Number(dados.sub),
    nivel_acesso: dados.nivel_acesso,
    clinica_id: dados.clinica_id ?? null,
  };
}

module.exports = { gerarTokenSessao, verificarTokenSessao };
