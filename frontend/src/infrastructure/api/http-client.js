async function parseJsonResposta(resposta) {
  const texto = await resposta.text();
  const conteudo = texto.trim();
  const contentType = resposta.headers.get("content-type") || "";

  if (!conteudo) {
    return {};
  }

  if (conteudo.startsWith("<") || conteudo.startsWith("<!")) {
    throw new Error(
      "O servidor devolveu HTML em vez de JSON. Inicie o backend com npm run backend ou configure o proxy em /api."
    );
  }

  try {
    return JSON.parse(conteudo);
  } catch {
    if (
      conteudo.toLowerCase().includes("proxy") ||
      conteudo.toLowerCase().includes("econnrefused")
    ) {
      throw new Error(
        "Nao foi possivel conectar ao backend. Use npm run iniciar para subir frontend e backend juntos."
      );
    }

    throw new Error(
      contentType && !contentType.includes("application/json")
        ? "A API nao retornou JSON. Verifique se o backend esta rodando em http://localhost:3333."
        : "Resposta do servidor em formato inesperado."
    );
  }
}

async function requisitarJson(url, opcoes = {}) {
  let resposta;
  const token = obterTokenSessao();
  const headers = {
    ...(opcoes.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    resposta = await fetch(url, {
      cache: "no-store",
      ...opcoes,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error(
      "Nao foi possivel conectar ao backend. Use npm run iniciar para subir frontend e backend juntos."
    );
  }

  const dados = await parseJsonResposta(resposta);

  if (!resposta.ok) {
    if (resposta.status === 401) {
      removerUsuarioSessao();
    }
    throw new Error(dados.mensagem || "Erro ao processar requisicao.");
  }

  return dados;
}

export { parseJsonResposta, requisitarJson };
import { obterTokenSessao, removerUsuarioSessao } from "../storage/sessao-usuario";
