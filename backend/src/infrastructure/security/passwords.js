const crypto = require("crypto");

const PARAMETROS_HASH = Object.freeze({
  keylen: 64,
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
});

function gerarHashSenha(senha) {
  const senhaTexto = String(senha || "");
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto
    .scryptSync(senhaTexto, salt, PARAMETROS_HASH.keylen, {
      N: PARAMETROS_HASH.cost,
      r: PARAMETROS_HASH.blockSize,
      p: PARAMETROS_HASH.parallelization,
    })
    .toString("base64url");

  return [
    "scrypt",
    PARAMETROS_HASH.cost,
    PARAMETROS_HASH.blockSize,
    PARAMETROS_HASH.parallelization,
    salt,
    hash,
  ].join("$");
}

function verificarSenha(senha, senhaHash) {
  const partes = String(senhaHash || "").split("$");
  if (partes.length !== 6 || partes[0] !== "scrypt") return false;

  const [, cost, blockSize, parallelization, salt, hashEsperado] = partes;
  const hashCalculado = crypto.scryptSync(String(senha || ""), salt, 64, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
  });
  const esperado = Buffer.from(hashEsperado, "base64url");

  return esperado.length === hashCalculado.length && crypto.timingSafeEqual(esperado, hashCalculado);
}

function pareceHashSenha(valor) {
  return String(valor || "").startsWith("scrypt$");
}

module.exports = { gerarHashSenha, pareceHashSenha, verificarSenha };
