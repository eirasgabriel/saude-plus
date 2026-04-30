import {
  atualizarClinicaApi,
  buscarClinicaPorIdApi,
  criarClinicaApi,
  listarClinicasApi,
} from "../../infrastructure/api/clinicas-api";
import { notificarClinicasAtualizadas } from "./clinicas-eventos";

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
    const atualizada = await atualizarClinicaApi(clinica.id, clinica);
    notificarClinicasAtualizadas();
    return atualizada;
  }

  const criada = await criarClinicaApi(clinica);
  notificarClinicasAtualizadas();
  return criada;
}

async function alternarStatusClinica(clinica) {
  const proximoStatus = clinica.status === "ativa" ? "temporariamente_fechada" : "ativa";
  const atualizada = await atualizarClinicaApi(clinica.id, {
    ...clinica,
    status: proximoStatus,
  });
  notificarClinicasAtualizadas();
  return atualizada;
}

export { listarClinicas, buscarClinicaPorId, salvarClinica, alternarStatusClinica };
