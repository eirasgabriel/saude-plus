const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { criarListarHorariosAgenda } = require("../src/application/agenda/listar-horarios-agenda");
const { criarCriarConsulta } = require("../src/application/consultas/criar-consulta");
const { criarObterRelatoriosSistema } = require("../src/application/sistema/obter-relatorios-sistema");
const { criarObterRelatorioClinica } = require("../src/application/sistema/obter-relatorio-clinica");
const { criarAgendaRepositoryMemory } = require("../src/infrastructure/repositories/memory/agenda-repository-memory");
const { criarClinicaRepositoryMemory } = require("../src/infrastructure/repositories/memory/clinica-repository-memory");
const { criarConsultaRepositoryMemory } = require("../src/infrastructure/repositories/memory/consulta-repository-memory");
const { criarExameRepositoryMemory } = require("../src/infrastructure/repositories/memory/exame-repository-memory");
const { criarUsuarioRepositoryMemory } = require("../src/infrastructure/repositories/memory/usuario-repository-memory");

const clinicaHospital = {
  id: 1,
  nome: "Hospital Nossa Senhora de Nazareth",
  bairro: "Verde Vale",
  status: "ativa",
  aberta: true,
  capacidadeDiaria: 20,
  atendimentosMes: 0,
  satisfacao: 95,
};

const usuarios = [
  { id: 1, nome: "Paciente Teste", nivel_acesso: "paciente", status: "ativo" },
  { id: 4, nome: "Dra. Teste", nivel_acesso: "medico", clinica_id: 1, status: "ativo" },
];

function criarCaminhoTemporario(prefixo) {
  const diretorioTemporario = path.join(__dirname, ".tmp");
  fs.mkdirSync(diretorioTemporario, { recursive: true });
  return path.join(diretorioTemporario, `${prefixo}-${Date.now()}-${Math.random()}.json`);
}

function obterDataAtualIso() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const consultaAgendada = {
  id: "consulta-agendada",
  paciente_id: 1,
  medico_id: 4,
  clinica_id: 1,
  especialidade: "Clinico geral",
  data: obterDataAtualIso(),
  horario: "10:00",
  status: "agendada",
};

const exameAgendado = {
  id: "exame-agendado",
  paciente_id: 1,
  medico_id: 4,
  clinica_id: 1,
  tipo: "Ressonancia Magnetica",
  data: obterDataAtualIso(),
  horario: "10:30",
  status: "agendado",
  resultado_disponivel: false,
};

function criarRepositoriosRelatorioFake() {
  return {
    clinicaRepository: {
      async listar() {
        return [clinicaHospital];
      },
      async buscarPorId(id) {
        return Number(id) === 1 ? clinicaHospital : null;
      },
    },
    usuarioRepository: {
      async listar() {
        return usuarios;
      },
    },
    consultaRepository: {
      async listarTodos() {
        return [consultaAgendada];
      },
      async listarPorClinica(clinicaId) {
        return Number(clinicaId) === 1 ? [consultaAgendada] : [];
      },
    },
    exameRepository: {
      async listarTodos() {
        return [exameAgendado];
      },
      async listarPorClinica(clinicaId) {
        return Number(clinicaId) === 1 ? [exameAgendado] : [];
      },
    },
  };
}

async function testeRelatorioSistemaContaConsultaAgendada() {
  const repositorios = criarRepositoriosRelatorioFake();
  const obterRelatoriosSistema = criarObterRelatoriosSistema(repositorios);
  const relatorio = await obterRelatoriosSistema();

  assert.equal(relatorio.resumo.consultasMes, 1);
  assert.equal(relatorio.resumo.examesMes, 1);
  assert.equal(relatorio.resumo.agendamentosMes, 2);
  assert.equal(relatorio.resumo.consultasPendentes, 1);
  assert.equal(relatorio.resumo.examesPendentes, 1);
  assert.equal(relatorio.resumo.consultasRealizadas, 0);
  assert.equal(relatorio.porClinica[0].consultas, 1);
  assert.equal(relatorio.porClinica[0].exames, 1);
  assert.equal(relatorio.porTipoExame[0].tipo, "Ressonancia Magnetica");
  assert.equal(relatorio.porStatusExames.agendado, 1);
  assert.equal(relatorio.porStatus.agendada, 1);
}

async function testeRelatorioClinicaContaConsultaAgendada() {
  const repositorios = criarRepositoriosRelatorioFake();
  const obterRelatorioClinica = criarObterRelatorioClinica(repositorios);
  const relatorio = await obterRelatorioClinica(1);

  assert.equal(relatorio.indicadores.consultas, 1);
  assert.equal(relatorio.indicadores.exames, 1);
  assert.equal(relatorio.indicadores.agendamentos, 2);
  assert.equal(relatorio.indicadores.pendentes, 1);
  assert.equal(relatorio.indicadores.examesPendentes, 1);
  assert.equal(relatorio.indicadores.realizadas, 0);
}

async function testeRelatorioSistemaIncluiExameSemConsulta() {
  const repositorios = criarRepositoriosRelatorioFake();
  repositorios.consultaRepository = {
    async listarTodos() {
      return [];
    },
    async listarPorClinica() {
      return [];
    },
  };
  const obterRelatoriosSistema = criarObterRelatoriosSistema(repositorios);
  const relatorio = await obterRelatoriosSistema();

  assert.equal(relatorio.resumo.consultasMes, 0);
  assert.equal(relatorio.resumo.examesMes, 1);
  assert.equal(relatorio.resumo.agendamentosMes, 1);
  assert.equal(relatorio.porClinica[0].consultas, 0);
  assert.equal(relatorio.porClinica[0].exames, 1);
  assert.equal(relatorio.examesRecentes.length, 1);
}

async function testeRelatorioClinicaIncluiExameSemConsulta() {
  const repositorios = criarRepositoriosRelatorioFake();
  repositorios.consultaRepository = {
    async listarTodos() {
      return [];
    },
    async listarPorClinica() {
      return [];
    },
  };
  const obterRelatorioClinica = criarObterRelatorioClinica(repositorios);
  const relatorio = await obterRelatorioClinica(1);

  assert.equal(relatorio.indicadores.consultas, 0);
  assert.equal(relatorio.indicadores.exames, 1);
  assert.equal(relatorio.indicadores.agendamentos, 1);
  assert.equal(relatorio.indicadores.examesPendentes, 1);
}

async function testeRelatorioContaConsultaComDataObjeto() {
  const consultaComDataObjeto = {
    ...consultaAgendada,
    data: new Date(`${obterDataAtualIso()}T00:00:00.000Z`),
  };
  const repositorios = criarRepositoriosRelatorioFake();
  repositorios.consultaRepository = {
    async listarTodos() {
      return [consultaComDataObjeto];
    },
    async listarPorClinica(clinicaId) {
      return Number(clinicaId) === 1 ? [consultaComDataObjeto] : [];
    },
  };
  const obterRelatoriosSistema = criarObterRelatoriosSistema(repositorios);
  const relatorio = await obterRelatoriosSistema();

  assert.equal(relatorio.resumo.consultasMes, 1);
  assert.equal(relatorio.consultasRecentes[0].data, obterDataAtualIso());
}

async function testeAgendamentoConsultaApareceNoRelatorio() {
  const caminhosTemporarios = [];
  function criarArquivoTemporario(prefixo) {
    const caminho = criarCaminhoTemporario(prefixo);
    caminhosTemporarios.push(caminho);
    return caminho;
  }

  const usuarioRepository = criarUsuarioRepositoryMemory(usuarios, {
    caminhoDados: criarArquivoTemporario("usuarios"),
  });
  const clinicaRepository = criarClinicaRepositoryMemory([clinicaHospital], {
    caminhoDados: criarArquivoTemporario("clinicas"),
  });
  const agendaRepository = criarAgendaRepositoryMemory();
  const consultaRepository = criarConsultaRepositoryMemory([], {
    caminhoDados: criarArquivoTemporario("consultas"),
  });
  const exameRepository = criarExameRepositoryMemory([], {
    caminhoDados: criarArquivoTemporario("exames"),
  });
  const data = obterDataAtualIso();
  const listarHorariosAgenda = criarListarHorariosAgenda({
    agendaRepository,
    consultaRepository,
    exameRepository,
    usuarioRepository,
  });
  const criarConsulta = criarCriarConsulta({
    agendaRepository,
    consultaRepository,
    exameRepository,
    usuarioRepository,
  });
  const obterRelatoriosSistema = criarObterRelatoriosSistema({
    clinicaRepository,
    usuarioRepository,
    consultaRepository,
    exameRepository,
  });
  try {
    const [slot] = await listarHorariosAgenda({
      clinicaId: 1,
      data,
      especialidade: "Clinico geral",
    });

    await criarConsulta({
      paciente_id: 1,
      medico_id: slot.medico_id,
      agenda_id: slot.id,
      clinica_id: 1,
      especialidade: "Clinico geral",
      status: "agendada",
    });

    const relatorio = await obterRelatoriosSistema();

    assert.equal(relatorio.resumo.consultasMes, 1);
    assert.equal(relatorio.porClinica[0].consultas, 1);
    assert.equal(relatorio.consultasRecentes[0].paciente, "Paciente Teste");
  } finally {
    caminhosTemporarios.forEach((caminho) => fs.rmSync(caminho, { force: true }));
  }
}

async function testeRepositorioConsultasRecarregaArquivoPersistido() {
  const caminhoDados = criarCaminhoTemporario("consultas");
  fs.writeFileSync(caminhoDados, "[]\n", "utf8");

  const consultaRepository = criarConsultaRepositoryMemory([], { caminhoDados });
  assert.equal((await consultaRepository.listarTodos()).length, 0);

  fs.writeFileSync(caminhoDados, `${JSON.stringify([consultaAgendada], null, 2)}\n`, "utf8");

  const consultas = await consultaRepository.listarTodos();
  assert.equal(consultas.length, 1);
  assert.equal(consultas[0].status, "agendada");

  fs.rmSync(caminhoDados, { force: true });
}

module.exports = {
  testeRelatorioSistemaContaConsultaAgendada,
  testeRelatorioClinicaContaConsultaAgendada,
  testeRelatorioSistemaIncluiExameSemConsulta,
  testeRelatorioClinicaIncluiExameSemConsulta,
  testeRelatorioContaConsultaComDataObjeto,
  testeAgendamentoConsultaApareceNoRelatorio,
  testeRepositorioConsultasRecarregaArquivoPersistido,
};
