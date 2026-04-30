function contarPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const chave = item[campo] || "nao_informado";
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
  const data = consulta.data || consulta.data_consulta || consulta.criado_em;
  if (!data) return false;

  const [ano, mes] = String(data).slice(0, 10).split("-").map(Number);
  return ano === periodo.ano && mes === periodo.mes;
}

function criarObterRelatoriosSistema({ clinicaRepository, usuarioRepository, consultaRepository }) {
  return async function obterRelatoriosSistema() {
    const [clinicas, usuarios, consultas] = await Promise.all([
      clinicaRepository.listar(),
      usuarioRepository.listar(),
      consultaRepository.listarTodos(),
    ]);
    const periodo = obterPeriodoAtual();
    const consultasDoPeriodo = consultas.filter((consulta) =>
      consultaPertenceAoPeriodo(consulta, periodo)
    );

    const realizadas = consultasDoPeriodo.filter((consulta) => consulta.status === "realizada").length;
    const canceladas = consultasDoPeriodo.filter((consulta) => consulta.status === "cancelada").length;
    const agendadas = consultasDoPeriodo.filter((consulta) =>
      ["agendada", "confirmada"].includes(consulta.status)
    ).length;

    const resumo = {
      totalClinicas: clinicas.length,
      clinicasAtivas: clinicas.filter((clinica) => clinica.status === "ativa" || clinica.aberta).length,
      totalUsuarios: usuarios.length,
      usuariosAtivos: usuarios.filter((usuario) => usuario.status === "ativo").length,
      consultasMes: consultasDoPeriodo.length,
      consultasRealizadas: realizadas,
      consultasPendentes: agendadas,
      consultasCanceladas: canceladas,
      taxaCancelamento: consultasDoPeriodo.length ? Math.round((canceladas / consultasDoPeriodo.length) * 100) : 0,
    };

    const porClinica = clinicas.map((clinica) => {
      const consultasDaClinica = consultasDoPeriodo.filter((consulta) => Number(consulta.clinica_id) === Number(clinica.id));
      const realizadasClinica = consultasDaClinica.filter((consulta) => consulta.status === "realizada").length;

      return {
        id: clinica.id,
        nome: clinica.nome,
        bairro: clinica.bairro,
        status: clinica.status,
        consultas: consultasDaClinica.length,
        realizadas: realizadasClinica,
        canceladas: consultasDaClinica.filter((consulta) => consulta.status === "cancelada").length,
        ocupacao: clinica.capacidadeDiaria
          ? Math.min(100, Math.round((consultasDaClinica.length / clinica.capacidadeDiaria) * 100))
          : 0,
        atendimentosMes: clinica.atendimentosMes || 0,
        satisfacao: clinica.satisfacao || 0,
      };
    });

    const porEspecialidade = Object.entries(contarPorCampo(consultasDoPeriodo, "especialidade"))
      .map(([especialidade, total]) => ({ especialidade, total }))
      .sort((a, b) => b.total - a.total);

    const porStatus = contarPorCampo(consultasDoPeriodo, "status");

    const consultasRecentes = [...consultas]
      .map((consulta) => ({
        ...consulta,
        clinica: obterNomeClinica(consulta.clinica_id, clinicas),
      }))
      .sort((a, b) => `${b.data || ""} ${b.horario || ""}`.localeCompare(`${a.data || ""} ${a.horario || ""}`));

    return {
      atualizadoEm: new Date().toISOString(),
      periodo,
      resumo,
      porClinica,
      porEspecialidade,
      porStatus,
      consultasRecentes,
    };
  };
}

module.exports = { criarObterRelatoriosSistema };
