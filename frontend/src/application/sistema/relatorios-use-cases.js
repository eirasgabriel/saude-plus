import {
  obterRelatorioClinicaApi,
  obterRelatoriosSistemaApi,
} from "../../infrastructure/api/relatorios-api";

const RELATORIO_VAZIO = {
  atualizadoEm: null,
  periodo: {
    mes: null,
    ano: null,
    rotulo: "",
  },
  resumo: {
    totalClinicas: 0,
    clinicasAtivas: 0,
    totalUsuarios: 0,
    usuariosAtivos: 0,
    consultasMes: 0,
    examesMes: 0,
    agendamentosMes: 0,
    consultasRealizadas: 0,
    consultasPendentes: 0,
    consultasCanceladas: 0,
    examesRealizados: 0,
    examesPendentes: 0,
    examesCancelados: 0,
    taxaCancelamento: 0,
  },
  porClinica: [],
  clinicas: [],
  porEspecialidade: [],
  porTipoExame: [],
  porStatus: {},
  porStatusExames: {},
  consultasRecentes: [],
  examesRecentes: [],
};

async function obterRelatoriosSistema() {
  const dados = await obterRelatoriosSistemaApi();
  const porClinica = Array.isArray(dados?.porClinica)
    ? dados.porClinica.map(({ satisfacao: _satisfacao, ...clinica }) => ({
        ...clinica,
        atendimentosMes:
          clinica.agendamentos != null ? Number(clinica.agendamentos || 0) : Number(clinica.atendimentosMes || 0),
      }))
    : [];
  const clinicas = Array.isArray(dados?.clinicas)
    ? dados.clinicas.map(({ atendimentosMes: _atendimentosMes, satisfacao: _satisfacao, ...clinica }) => clinica)
    : [];

  return {
    ...RELATORIO_VAZIO,
    ...dados,
    periodo: {
      ...RELATORIO_VAZIO.periodo,
      ...(dados?.periodo || {}),
    },
    resumo: {
      ...RELATORIO_VAZIO.resumo,
      ...(dados?.resumo || {}),
    },
    clinicas,
    porClinica,
    porEspecialidade: Array.isArray(dados?.porEspecialidade) ? dados.porEspecialidade : [],
    porTipoExame: Array.isArray(dados?.porTipoExame) ? dados.porTipoExame : [],
    consultasRecentes: Array.isArray(dados?.consultasRecentes) ? dados.consultasRecentes : [],
    examesRecentes: Array.isArray(dados?.examesRecentes) ? dados.examesRecentes : [],
    porStatus: dados?.porStatus || {},
    porStatusExames: dados?.porStatusExames || {},
  };
}

async function obterRelatorioClinica(clinicaId) {
  const dados = await obterRelatorioClinicaApi(clinicaId);
  const {
    atendimentosMes: _clinicaAtendimentosMes,
    satisfacao: _clinicaSatisfacao,
    ...clinica
  } = dados?.clinica || {};
  const indicadoresOriginais = dados?.indicadores || {};
  const {
    satisfacao: _indicadoresSatisfacao,
    ...indicadores
  } = indicadoresOriginais;
  const atendimentosMes =
    indicadores.agendamentos != null
      ? Number(indicadores.agendamentos || 0)
      : Number(indicadores.atendimentosMes || 0);

  return {
    atualizadoEm: dados?.atualizadoEm || null,
    periodo: {
      ...RELATORIO_VAZIO.periodo,
      ...(dados?.periodo || {}),
    },
    clinica: dados?.clinica ? clinica : null,
    indicadores: {
      consultas: 0,
      exames: 0,
      agendamentos: 0,
      realizadas: 0,
      canceladas: 0,
      pendentes: 0,
      examesRealizados: 0,
      examesCancelados: 0,
      examesPendentes: 0,
      ocupacao: 0,
      atendimentosMes: 0,
      capacidadeDiaria: 0,
      status: "nao informado",
      ...indicadores,
      atendimentosMes,
    },
  };
}

function obterNomeClinica(clinicaId, clinicas = []) {
  return clinicas.find((clinica) => Number(clinica.id) === Number(clinicaId))?.nome || "Sem clinica";
}

export { RELATORIO_VAZIO, obterRelatorioClinica, obterRelatoriosSistema, obterNomeClinica };
