const CHAVE_USUARIO = "saude_usuario";

function salvarUsuarioSessao(usuario) {
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

function removerUsuarioSessao() {
  localStorage.removeItem(CHAVE_USUARIO);
}

function existeUsuarioSessao() {
  return !!localStorage.getItem(CHAVE_USUARIO);
}

function obterUsuarioSessao() {
  const dados = localStorage.getItem(CHAVE_USUARIO);
  return dados ? JSON.parse(dados) : null;
}

export {
  CHAVE_USUARIO,
  salvarUsuarioSessao,
  removerUsuarioSessao,
  existeUsuarioSessao,
  obterUsuarioSessao,
};
