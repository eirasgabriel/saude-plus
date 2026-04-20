import { requisitarJson } from "./http-client";

async function listarClinicasApi() {
  return requisitarJson("/api/clinicas");
}

async function buscarClinicaPorIdApi(id) {
  return requisitarJson(`/api/clinicas/${encodeURIComponent(String(id))}`);
}

async function criarClinicaApi(clinica) {
  return requisitarJson("/api/clinicas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clinica),
  });
}

async function atualizarClinicaApi(id, clinica) {
  return requisitarJson(`/api/clinicas/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clinica),
  });
}

export { listarClinicasApi, buscarClinicaPorIdApi, criarClinicaApi, atualizarClinicaApi };
