function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
}

async function buscarEnderecoPorCep(cepInformado) {
  const cep = somenteNumeros(cepInformado);

  if (cep.length !== 8) {
    throw new Error("Informe um CEP com 8 digitos.");
  }

  let resposta;

  try {
    resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  } catch {
    throw new Error("Nao foi possivel consultar o CEP agora.");
  }

  if (!resposta.ok) {
    throw new Error("Nao foi possivel consultar o CEP informado.");
  }

  const dados = await resposta.json();

  if (dados.erro) {
    throw new Error("CEP nao encontrado.");
  }

  return {
    cep,
    endereco: dados.logradouro || "",
    bairro: dados.bairro || "",
    cidade: dados.localidade || "",
    estado: dados.uf || "",
  };
}

export { buscarEnderecoPorCep };
