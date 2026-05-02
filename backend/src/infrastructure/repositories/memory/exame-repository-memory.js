const fs = require("fs");
const path = require("path");
const { examesSeed } = require("./seeds");

const CAMINHO_PADRAO_DADOS = path.resolve(__dirname, "../../../../data/exames.json");

function copiarExame(exame) {
  return JSON.parse(JSON.stringify(exame));
}

function mesmoId(a, b) {
  return String(a) === String(b);
}

function carregarRegistros(exames, caminhoDados) {
  if (!fs.existsSync(caminhoDados)) {
    return exames.map(copiarExame);
  }

  try {
    const conteudo = fs.readFileSync(caminhoDados, "utf8");
    const dados = JSON.parse(conteudo);

    if (Array.isArray(dados)) {
      return dados.map(copiarExame);
    }

    console.warn(`Arquivo de exames ignorado: formato invalido em ${caminhoDados}`);
  } catch (erro) {
    console.warn(`Nao foi possivel carregar exames persistidos em ${caminhoDados}:`, erro.message);
  }

  return exames.map(copiarExame);
}

async function persistirRegistros(caminhoDados, registros) {
  await fs.promises.mkdir(path.dirname(caminhoDados), { recursive: true });

  const temporario = `${caminhoDados}.tmp`;
  const conteudo = `${JSON.stringify(registros, null, 2)}\n`;

  await fs.promises.writeFile(temporario, conteudo, "utf8");
  await fs.promises.rm(caminhoDados, { force: true });
  await fs.promises.rename(temporario, caminhoDados);
}

function criarExameRepositoryMemory(exames = examesSeed, opcoes = {}) {
  const caminhoDados = opcoes.caminhoDados || CAMINHO_PADRAO_DADOS;
  const registros = carregarRegistros(exames, caminhoDados);

  return {
    async criar(exame) {
      const exameCriado = {
        ...exame,
        id: exame.id || `exame-${Date.now()}`,
        criado_em: exame.criado_em || new Date().toISOString(),
      };

      registros.unshift(exameCriado);
      await persistirRegistros(caminhoDados, registros);
      return copiarExame(exameCriado);
    },

    async listarPorPaciente(pacienteId) {
      return registros
        .filter((exame) => Number(exame.paciente_id) === Number(pacienteId))
        .map(copiarExame);
    },

    async listarPorClinica(clinicaId) {
      return registros
        .filter((exame) => Number(exame.clinica_id) === Number(clinicaId))
        .map(copiarExame);
    },

    async listarPorClinicaEMedico(clinicaId, medicoId) {
      return registros
        .filter(
          (exame) =>
            Number(exame.clinica_id) === Number(clinicaId) &&
            Number(exame.medico_id) === Number(medicoId)
        )
        .map(copiarExame);
    },

    async listarTodos() {
      return registros.map(copiarExame);
    },

    async buscarPorId(exameId) {
      const exame = registros.find((item) => mesmoId(item.id, exameId));
      return exame ? copiarExame(exame) : null;
    },

    async atualizar(exameId, dados) {
      const indice = registros.findIndex((exame) => mesmoId(exame.id, exameId));
      if (indice < 0) return null;

      registros[indice] = { ...registros[indice], ...dados, id: registros[indice].id };
      await persistirRegistros(caminhoDados, registros);
      return copiarExame(registros[indice]);
    },

    async substituirPorClinica(clinicaId, examesAtualizados) {
      const idsMantidos = new Set(examesAtualizados.map((exame) => String(exame.id)));
      const outros = registros.filter(
        (exame) =>
          Number(exame.clinica_id) !== Number(clinicaId) || idsMantidos.has(String(exame.id))
      );
      const atualizadosPorId = new Map(examesAtualizados.map((exame) => [String(exame.id), exame]));

      const proximos = outros.map((exame) => {
        const atualizado = atualizadosPorId.get(String(exame.id));
        return atualizado ? { ...exame, ...atualizado, id: exame.id } : exame;
      });

      registros.splice(0, registros.length, ...proximos);
      await persistirRegistros(caminhoDados, registros);
      return examesAtualizados.map(copiarExame);
    },

    async excluir(exameId) {
      const indice = registros.findIndex((exame) => mesmoId(exame.id, exameId));
      if (indice >= 0) {
        registros.splice(indice, 1);
        await persistirRegistros(caminhoDados, registros);
      }

      return { ok: true };
    },
  };
}

module.exports = { criarExameRepositoryMemory };
