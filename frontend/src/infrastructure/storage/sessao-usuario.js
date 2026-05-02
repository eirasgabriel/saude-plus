const CHAVE_USUARIO = "saude_usuario";
const CHAVE_TOKEN = "saude_token";

function salvarUsuarioSessao(usuario, token = "") {
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
  if (token) {
    localStorage.setItem(CHAVE_TOKEN, token);
  }
}

function removerUsuarioSessao() {
  localStorage.removeItem(CHAVE_USUARIO);
  localStorage.removeItem(CHAVE_TOKEN);
}

function existeUsuarioSessao() {
  return !!localStorage.getItem(CHAVE_USUARIO);
}

function obterUsuarioSessao() {
  const dados = localStorage.getItem(CHAVE_USUARIO);
  if (!dados) return null;

  try {
    return JSON.parse(dados);
  } catch {
    removerUsuarioSessao();
    return null;
  }
}

function obterTokenSessao() {
  return localStorage.getItem(CHAVE_TOKEN) || "";
}

export {
  CHAVE_TOKEN,
  CHAVE_USUARIO,
  salvarUsuarioSessao,
  removerUsuarioSessao,
  existeUsuarioSessao,
  obterUsuarioSessao,
  obterTokenSessao,
};
