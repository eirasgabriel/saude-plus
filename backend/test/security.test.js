const assert = require("node:assert/strict");
const { gerarHashSenha, verificarSenha } = require("../src/infrastructure/security/passwords");
const { gerarTokenSessao, verificarTokenSessao } = require("../src/infrastructure/security/tokens");

function testeHashSenha() {
  const senha = "SenhaForte123!";
  const hash = gerarHashSenha(senha);

  assert.notEqual(hash, senha);
  assert.equal(verificarSenha(senha, hash), true);
  assert.equal(verificarSenha("senha-errada", hash), false);
}

function testeTokenSessao() {
  const usuario = {
    id: 10,
    nivel_acesso: "admin_clinica",
    clinica_id: 2,
  };
  const token = gerarTokenSessao(usuario, {
    jwtSecret: "segredo-local-de-teste-com-tamanho-suficiente",
    ttlSegundos: 60,
  });

  const payload = verificarTokenSessao(token, {
    jwtSecret: "segredo-local-de-teste-com-tamanho-suficiente",
  });

  assert.deepEqual(payload, usuario);
  assert.throws(
    () => verificarTokenSessao(token, { jwtSecret: "outro-segredo-local-de-teste" }),
    /Token invalido/
  );
}

module.exports = { testeHashSenha, testeTokenSessao };
