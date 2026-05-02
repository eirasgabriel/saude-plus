const { AppError } = require("../../domain/errors/app-error");

function obterPeriodoAtual(agora = new Date()) {
  const mes = agora.getMonth() + 1;
  const ano = agora.getFullYear();

  return {
    mes,
    ano,
    rotulo: `${String(mes).padStart(2, "0")}/${ano}`,
  };
}

function consultaPertenceAoPeriodo(consulta, periodo) {
  const data = obterDataIsoRegistro(consulta);
  if (!data) return false;

  const [ano, mes] = String(data).slice(0, 10).split("-").map(Number);
  return ano === periodo.ano && mes === periodo.mes;
}

function obterDataIsoRegistro(registro) {
  const valor = registro.data || registro.data_consulta || registro.criado_em;
  if (!valor) return "";

  const texto = String(valor);
  const dataIso = /\d{4}-\d{2}-\d{2}/.exec(texto);
  if (dataIso) return dataIso[0];

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

  return data.toISOString().slice(0, 10);
}

function normalizarStatus(status) {
  return String(status || "nao_informado").trim().toLowerCase();
}

function consultaEstaAgendada(consulta) {
  return ["agendada", "agendado", "confirmada", "confirmado"].includes(
    normalizarStatus(consulta.status)
  );
}

function exameEstaAgendado(exame) {
  if (exame.resultado_disponivel) return false;
  return ["agendado", "agendada", "confirmado", "confirmada"].includes(
    normalizarStatus(exame.status)
  );
}

function exameEstaRealizado(exame) {
  return exame.resultado_disponivel || ["realizado", "realizada"].includes(normalizarStatus(exame.status));
}

function exameEstaCancelado(exame) {
  return ["cancelado", "cancelada"].includes(normalizarStatus(exame.status));
}

function consultaEstaRealizada(consulta) {
  return ["realizada", "realizado"].includes(normalizarStatus(consulta.status));
}

function consultaEstaCancelada(consulta) {
  return ["cancelada", "cancelado"].includes(normalizarStatus(consulta.status));
}

function prepararConsultasParaRelatorio(consultas, usuarios) {
  const pacientesCadastrados = new Map(
    usuarios
      .filter((usuario) => usuario.nivel_acesso === "paciente")
      .map((usuario) => [Number(usuario.id), usuario])
  );

  return consultas.map((consulta) => {
    const paciente = pacientesCadastrados.get(Number(consulta.paciente_id));

    return {
      ...consulta,
      paciente: consulta.paciente || paciente?.nome || `Paciente ${consulta.paciente_id || ""}`.trim(),
      data: obterDataIsoRegistro(consulta),
      status: normalizarStatus(consulta.status),
    };
  });
}

function prepararExamesParaRelatorio(exames) {
  return exames.map((exame) => ({
    ...exame,
    data: obterDataIsoRegistro(exame),
    status: normalizarStatus(exame.status),
  }));
}

async function listarExamesPorClinica(exameRepository, clinicaId) {
  if (!exameRepository?.listarPorClinica) return [];
  const exames = await exameRepository.listarPorClinica(clinicaId);
  return Array.isArray(exames) ? exames : [];
}

function registrarDebug(debug, escopo, dados) {
  if (debug) {
    console.info(`[relatorios] ${escopo}`, dados);
  }
}

function criarObterRelatorioClinica({
  clinicaRepository,
  consultaRepository,
  usuarioRepository,
  exameRepository = null,
  debug = false,
}) {
  return async function obterRelatorioClinica(clinicaId) {
    const clinica = await clinicaRepository.buscarPorId(clinicaId);
    if (!clinica) {
      throw new AppError("Clinica nao encontrada.", 404, "CLINICA_NAO_ENCONTRADA");
    }

    const periodo = obterPeriodoAtual();
    const [consultas, usuarios, exames] = await Promise.all([
      consultaRepository.listarPorClinica(clinicaId),
      usuarioRepository.listar(),
      listarExamesPorClinica(exameRepository, clinicaId),
    ]);
    const consultasValidas = prepararConsultasParaRelatorio(consultas, usuarios);
    const examesValidos = prepararExamesParaRelatorio(exames);
    const consultasDoPeriodo = consultasValidas.filter((consulta) =>
      consultaPertenceAoPeriodo(consulta, periodo)
    );
    const examesDoPeriodo = examesValidos.filter((exame) =>
      consultaPertenceAoPeriodo(exame, periodo)
    );

    const realizadas = consultasDoPeriodo.filter(consultaEstaRealizada).length;
    const canceladas = consultasDoPeriodo.filter(consultaEstaCancelada).length;
    const pendentes = consultasDoPeriodo.filter(consultaEstaAgendada).length;
    const examesRealizados = examesDoPeriodo.filter(exameEstaRealizado).length;
    const examesCancelados = examesDoPeriodo.filter(exameEstaCancelado).length;
    const examesPendentes = examesDoPeriodo.filter(exameEstaAgendado).length;
    const agendamentos = consultasDoPeriodo.length + examesDoPeriodo.length;

    registrarDebug(debug, "clinica:origem", {
      clinicaId,
      periodo,
      consultas: consultas.length,
      exames: exames.length,
      consultasDoPeriodo: consultasDoPeriodo.length,
      examesDoPeriodo: examesDoPeriodo.length,
    });

    const {
      atendimentosMes: _atendimentosMes,
      satisfacao: _satisfacao,
      ...clinicaSemMetricasEstaticas
    } = clinica;

    return {
      atualizadoEm: new Date().toISOString(),
      periodo,
      clinica: clinicaSemMetricasEstaticas,
      indicadores: {
        consultas: consultasDoPeriodo.length,
        exames: examesDoPeriodo.length,
        agendamentos,
        realizadas,
        canceladas,
        pendentes,
        examesRealizados,
        examesCancelados,
        examesPendentes,
        ocupacao: clinica.capacidadeDiaria
          ? Math.min(100, Math.round((agendamentos / clinica.capacidadeDiaria) * 100))
          : 0,
        atendimentosMes: agendamentos,
        capacidadeDiaria: Number(clinica.capacidadeDiaria || 0),
        status: clinica.status || "nao informado",
      },
    };
  };
}

module.exports = { criarObterRelatorioClinica };
