import {
  atualizarClinicaApi,
  buscarClinicaPorIdApi,
  criarClinicaApi,
  listarClinicasApi,
} from "../../infrastructure/api/clinicas-api";

async function listarClinicas() {
  const dados = await listarClinicasApi();
  return Array.isArray(dados) ? dados : [];
}

async function buscarClinicaPorId(id) {
  if (!id) return null;
  return buscarClinicaPorIdApi(id);
}

async function salvarClinica(clinica) {
  if (clinica.id) {
    return atualizarClinicaApi(clinica.id, clinica);
  }

  return criarClinicaApi(clinica);
}

async function alternarStatusClinica(clinica) {
  const proximoStatus = clinica.status === "ativa" ? "temporariamente_fechada" : "ativa";
  return atualizarClinicaApi(clinica.id, {
    ...clinica,
    status: proximoStatus,
  });
}

export { listarClinicas, buscarClinicaPorId, salvarClinica, alternarStatusClinica };
