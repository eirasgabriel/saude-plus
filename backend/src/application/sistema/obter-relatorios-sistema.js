function contarPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const chave = campo === "status" ? normalizarStatus(item[campo]) : item[campo] || "nao_informado";
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {});
}

function obterNomeClinica(clinicaId, clinicas) {
  return clinicas.find((clinica) => Number(clinica.id) === Number(clinicaId))?.nome || "Sem clinica";
}

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
  const medicosCadastrados = new Map(
    usuarios
      .filter((usuario) => usuario.nivel_acesso === "medico")
      .map((usuario) => [Number(usuario.id), usuario])
  );

  return consultas.map((consulta) => {
    const paciente = pacientesCadastrados.get(Number(consulta.paciente_id));
    const medico = medicosCadastrados.get(Number(consulta.medico_id));

    return {
      ...consulta,
      paciente: consulta.paciente || paciente?.nome || `Paciente ${consulta.paciente_id || ""}`.trim(),
      medico: consulta.medico || medico?.nome || `Medico ${consulta.medico_id || ""}`.trim(),
      data: obterDataIsoRegistro(consulta),
      status: normalizarStatus(consulta.status),
    };
  });
}

function prepararExamesParaRelatorio(exames, usuarios) {
  const pacientesCadastrados = new Map(
    usuarios
      .filter((usuario) => usuario.nivel_acesso === "paciente")
      .map((usuario) => [Number(usuario.id), usuario])
  );
  const medicosCadastrados = new Map(
    usuarios
      .filter((usuario) => usuario.nivel_acesso === "medico")
      .map((usuario) => [Number(usuario.id), usuario])
  );

  return exames.map((exame) => {
    const paciente = pacientesCadastrados.get(Number(exame.paciente_id));
    const medico = medicosCadastrados.get(Number(exame.medico_id));

    return {
      ...exame,
      paciente: exame.paciente || paciente?.nome || `Paciente ${exame.paciente_id || ""}`.trim(),
      medico: exame.medico || medico?.nome || `Medico ${exame.medico_id || ""}`.trim(),
      data: obterDataIsoRegistro(exame),
      status: normalizarStatus(exame.status),
      tipo: exame.tipo || "nao_informado",
    };
  });
}

async function listarTodosExames(exameRepository) {
  if (!exameRepository?.listarTodos) return [];
  const exames = await exameRepository.listarTodos();
  return Array.isArray(exames) ? exames : [];
}

function registrarDebug(debug, escopo, dados) {
  if (debug) {
    console.info(`[relatorios] ${escopo}`, dados);
  }
}

function criarObterRelatoriosSistema({
  clinicaRepository,
  usuarioRepository,
  consultaRepository,
  exameRepository = null,
  debug = false,
}) {
  return async function obterRelatoriosSistema() {
    const [clinicas, usuarios, consultas, exames] = await Promise.all([
      clinicaRepository.listar(),
      usuarioRepository.listar(),
      consultaRepository.listarTodos(),
      listarTodosExames(exameRepository),
    ]);
    const consultasValidas = prepararConsultasParaRelatorio(consultas, usuarios);
    const examesValidos = prepararExamesParaRelatorio(exames, usuarios);
    const periodo = obterPeriodoAtual();
    const consultasDoPeriodo = consultasValidas.filter((consulta) =>
      consultaPertenceAoPeriodo(consulta, periodo)
    );
    const examesDoPeriodo = examesValidos.filter((exame) =>
      consultaPertenceAoPeriodo(exame, periodo)
    );

    const realizadas = consultasDoPeriodo.filter(consultaEstaRealizada).length;
    const canceladas = consultasDoPeriodo.filter(consultaEstaCancelada).length;
    const agendadas = consultasDoPeriodo.filter(consultaEstaAgendada).length;
    const examesRealizados = examesDoPeriodo.filter(exameEstaRealizado).length;
    const examesCancelados = examesDoPeriodo.filter(exameEstaCancelado).length;
    const examesPendentes = examesDoPeriodo.filter(exameEstaAgendado).length;
    const agendamentosMes = consultasDoPeriodo.length + examesDoPeriodo.length;

    registrarDebug(debug, "sistema:origem", {
      periodo,
      consultas: consultas.length,
      exames: exames.length,
      consultasDoPeriodo: consultasDoPeriodo.length,
      examesDoPeriodo: examesDoPeriodo.length,
    });

    const resumo = {
      totalClinicas: clinicas.length,
      clinicasAtivas: clinicas.filter((clinica) => clinica.status === "ativa" || clinica.aberta).length,
      totalUsuarios: usuarios.length,
      usuariosAtivos: usuarios.filter((usuario) => usuario.status === "ativo").length,
      consultasMes: consultasDoPeriodo.length,
      examesMes: examesDoPeriodo.length,
      agendamentosMes,
      consultasRealizadas: realizadas,
      consultasPendentes: agendadas,
      consultasCanceladas: canceladas,
      examesRealizados,
      examesPendentes,
      examesCancelados,
      taxaCancelamento: consultasDoPeriodo.length ? Math.round((canceladas / consultasDoPeriodo.length) * 100) : 0,
    };

    const porClinica = clinicas.map((clinica) => {
      const consultasDaClinica = consultasDoPeriodo.filter((consulta) => Number(consulta.clinica_id) === Number(clinica.id));
      const examesDaClinica = examesDoPeriodo.filter((exame) => Number(exame.clinica_id) === Number(clinica.id));
      const realizadasClinica = consultasDaClinica.filter(consultaEstaRealizada).length;
      const agendamentosClinica = consultasDaClinica.length + examesDaClinica.length;

      return {
        id: clinica.id,
        nome: clinica.nome,
        bairro: clinica.bairro,
        status: clinica.status,
        consultas: consultasDaClinica.length,
        exames: examesDaClinica.length,
        agendamentos: agendamentosClinica,
        realizadas: realizadasClinica,
        canceladas: consultasDaClinica.filter(consultaEstaCancelada).length,
        ocupacao: clinica.capacidadeDiaria
          ? Math.min(100, Math.round((agendamentosClinica / clinica.capacidadeDiaria) * 100))
          : 0,
        atendimentosMes: agendamentosClinica,
      };
    });

    const clinicasSemMetricasEstaticas = clinicas.map(
      ({ atendimentosMes: _atendimentosMes, satisfacao: _satisfacao, ...clinica }) => clinica
    );

    const porEspecialidade = Object.entries(contarPorCampo(consultasDoPeriodo, "especialidade"))
      .map(([especialidade, total]) => ({ especialidade, total }))
      .sort((a, b) => b.total - a.total);

    const porStatus = contarPorCampo(consultasDoPeriodo, "status");
    const porStatusExames = contarPorCampo(examesDoPeriodo, "status");
    const porTipoExame = Object.entries(contarPorCampo(examesDoPeriodo, "tipo"))
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total);

    const consultasRecentes = [...consultasValidas]
      .map((consulta) => ({
        ...consulta,
        clinica: obterNomeClinica(consulta.clinica_id, clinicas),
      }))
      .sort((a, b) => `${b.data || ""} ${b.horario || ""}`.localeCompare(`${a.data || ""} ${a.horario || ""}`));
    const examesRecentes = [...examesValidos]
      .map((exame) => ({
        ...exame,
        clinica: obterNomeClinica(exame.clinica_id, clinicas),
      }))
      .sort((a, b) => `${b.data || ""} ${b.horario || ""}`.localeCompare(`${a.data || ""} ${a.horario || ""}`));

    return {
      atualizadoEm: new Date().toISOString(),
      periodo,
      clinicas: clinicasSemMetricasEstaticas,
      resumo,
      porClinica,
      porEspecialidade,
      porTipoExame,
      porStatus,
      porStatusExames,
      consultasRecentes,
      examesRecentes,
    };
  };
}

module.exports = { criarObterRelatoriosSistema };
