async function parseJsonResposta(resposta) {
  const texto = await resposta.text();
  const conteudo = texto.trim();

  if (!conteudo) {
    return {};
  }

  if (conteudo.startsWith("<") || conteudo.startsWith("<!")) {
    throw new Error(
      "O servidor devolveu HTML em vez de JSON. Use npm run iniciar para o mock de API em desenvolvimento ou configure um backend em /api."
    );
  }

  try {
    return JSON.parse(conteudo);
  } catch {
    throw new Error("Resposta do servidor em formato inesperado.");
  }
}

async function requisitarJson(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);
  const dados = await parseJsonResposta(resposta);

  if (!resposta.ok) {
    throw new Error(dados.mensagem || "Erro ao processar requisicao.");
  }

  return dados;
}

export { parseJsonResposta, requisitarJson };
