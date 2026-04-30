import { obterRelatoriosSistemaApi } from "../../infrastructure/api/relatorios-api";

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
    consultasRealizadas: 0,
    consultasPendentes: 0,
    consultasCanceladas: 0,
    taxaCancelamento: 0,
  },
  porClinica: [],
  porEspecialidade: [],
  porStatus: {},
  consultasRecentes: [],
};

async function obterRelatoriosSistema() {
  const dados = await obterRelatoriosSistemaApi();
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
  };
}

function obterNomeClinica(clinicaId, clinicas = []) {
  return clinicas.find((clinica) => Number(clinica.id) === Number(clinicaId))?.nome || "Sem clinica";
}

export { RELATORIO_VAZIO, obterRelatoriosSistema, obterNomeClinica };
