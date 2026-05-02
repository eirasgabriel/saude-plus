const fs = require("fs");
const path = require("path");
const { clinicasSeed } = require("./seeds");

const CAMINHO_PADRAO_DADOS = path.resolve(__dirname, "../../../../data/clinicas.json");

function copiarClinica(clinica) {
  const copia = JSON.parse(JSON.stringify(clinica));
  delete copia.atendimentosMes;
  delete copia.satisfacao;
  return copia;
}

function carregarRegistros(clinicas, caminhoDados) {
  if (!fs.existsSync(caminhoDados)) {
    return clinicas.map(copiarClinica);
  }

  try {
    const conteudo = fs.readFileSync(caminhoDados, "utf8");
    const dados = JSON.parse(conteudo);

    if (Array.isArray(dados)) {
      return dados.map(copiarClinica);
    }

    console.warn(`Arquivo de clinicas ignorado: formato invalido em ${caminhoDados}`);
  } catch (erro) {
    console.warn(`Nao foi possivel carregar clinicas persistidas em ${caminhoDados}:`, erro.message);
  }

  return clinicas.map(copiarClinica);
}

async function persistirRegistros(caminhoDados, registros) {
  await fs.promises.mkdir(path.dirname(caminhoDados), { recursive: true });

  const temporario = `${caminhoDados}.tmp`;
  const conteudo = `${JSON.stringify(registros, null, 2)}\n`;

  await fs.promises.writeFile(temporario, conteudo, "utf8");
  await fs.promises.rm(caminhoDados, { force: true });
  await fs.promises.rename(temporario, caminhoDados);
}

function criarClinicaRepositoryMemory(clinicas = clinicasSeed, opcoes = {}) {
  const caminhoDados = opcoes.caminhoDados || CAMINHO_PADRAO_DADOS;
  const registros = carregarRegistros(clinicas, caminhoDados);

  return {
    async listar() {
      return registros.map(copiarClinica);
    },

    async buscarPorId(id) {
      const clinica = registros.find((item) => Number(item.id) === Number(id));
      return clinica ? copiarClinica(clinica) : null;
    },

    async salvar(dados) {
      const clinica = {
        id: Math.max(...registros.map((item) => Number(item.id)), 0) + 1,
        emoji: "+",
        ...dados,
        aberta: dados.status ? dados.status === "ativa" : dados.aberta !== false,
      };

      registros.unshift(clinica);
      await persistirRegistros(caminhoDados, registros);
      return copiarClinica(clinica);
    },

    async atualizar(id, dados) {
      const index = registros.findIndex((clinica) => Number(clinica.id) === Number(id));
      if (index < 0) return null;

      registros[index] = {
        ...registros[index],
        ...dados,
        id: registros[index].id,
        aberta: dados.status ? dados.status === "ativa" : dados.aberta ?? registros[index].aberta,
      };

      await persistirRegistros(caminhoDados, registros);
      return copiarClinica(registros[index]);
    },
  };
}

module.exports = { criarClinicaRepositoryMemory };
