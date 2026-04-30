const fs = require("fs");
const path = require("path");
const { consultasSeed } = require("./seeds");

const CAMINHO_PADRAO_DADOS = path.resolve(__dirname, "../../../../data/consultas.json");

function copiarConsulta(consulta) {
  return JSON.parse(JSON.stringify(consulta));
}

function mesmoId(a, b) {
  return String(a) === String(b);
}

function carregarRegistros(consultas, caminhoDados) {
  if (!fs.existsSync(caminhoDados)) {
    return consultas.map(copiarConsulta);
  }

  try {
    const conteudo = fs.readFileSync(caminhoDados, "utf8");
    const dados = JSON.parse(conteudo);

    if (Array.isArray(dados)) {
      return dados.map(copiarConsulta);
    }

    console.warn(`Arquivo de consultas ignorado: formato invalido em ${caminhoDados}`);
  } catch (erro) {
    console.warn(`Nao foi possivel carregar consultas persistidas em ${caminhoDados}:`, erro.message);
  }

  return consultas.map(copiarConsulta);
}

async function persistirRegistros(caminhoDados, registros) {
  await fs.promises.mkdir(path.dirname(caminhoDados), { recursive: true });

  const temporario = `${caminhoDados}.tmp`;
  const conteudo = `${JSON.stringify(registros, null, 2)}\n`;

  await fs.promises.writeFile(temporario, conteudo, "utf8");
  await fs.promises.rm(caminhoDados, { force: true });
  await fs.promises.rename(temporario, caminhoDados);
}

function criarConsultaRepositoryMemory(consultas = consultasSeed, opcoes = {}) {
  const caminhoDados = opcoes.caminhoDados || CAMINHO_PADRAO_DADOS;
  const registros = carregarRegistros(consultas, caminhoDados);

  return {
    async criar(consulta) {
      const consultaCriada = {
        ...consulta,
        id: consulta.id || Date.now(),
        criado_em: consulta.criado_em || new Date().toISOString(),
      };

      registros.push(consultaCriada);
      await persistirRegistros(caminhoDados, registros);
      return copiarConsulta(consultaCriada);
    },

    async listarPorPaciente(pacienteId) {
      return registros
        .filter((consulta) => Number(consulta.paciente_id) === Number(pacienteId))
        .map(copiarConsulta);
    },

    async listarPorClinica(clinicaId) {
      return registros
        .filter((consulta) => Number(consulta.clinica_id) === Number(clinicaId))
        .map(copiarConsulta);
    },

    async listarTodos() {
      return registros.map(copiarConsulta);
    },

    async cancelar(consultaId, motivo) {
      const consulta = registros.find((item) => mesmoId(item.id, consultaId));

      if (consulta) {
        consulta.status = "cancelada";
        consulta.motivo_cancelamento = motivo || "";
        consulta.cancelado_em = new Date().toISOString();
        await persistirRegistros(caminhoDados, registros);
      }

      return { ok: true, status: "cancelada" };
    },
  };
}

module.exports = { criarConsultaRepositoryMemory };
