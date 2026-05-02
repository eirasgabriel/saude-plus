import { requisitarJson } from "./http-client";

async function buscarExamesPacienteApi(pacienteId) {
  return requisitarJson(`/api/exames?paciente=${encodeURIComponent(String(pacienteId))}`);
}

async function buscarExamesClinicaApi(clinicaId, medicoId = null) {
  const params = new URLSearchParams({ clinica: String(clinicaId) });

  if (medicoId != null && medicoId !== "") {
    params.set("medico", String(medicoId));
  }

  return requisitarJson(`/api/exames?${params.toString()}`);
}

async function criarExameApi(dadosExame) {
  return requisitarJson("/api/exames", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosExame),
  });
}

async function anexarResultadoExameApi(exameId, dadosResultado) {
  return requisitarJson(`/api/exames/${encodeURIComponent(String(exameId))}/resultado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosResultado),
  });
}

async function salvarExamesClinicaApi(clinicaId, exames) {
  return requisitarJson(`/api/exames?clinica=${encodeURIComponent(String(clinicaId))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exames }),
  });
}

async function excluirExameApi(exameId) {
  return requisitarJson(`/api/exames/${encodeURIComponent(String(exameId))}`, {
    method: "DELETE",
  });
}

export {
  anexarResultadoExameApi,
  buscarExamesClinicaApi,
  buscarExamesPacienteApi,
  criarExameApi,
  excluirExameApi,
  salvarExamesClinicaApi,
};
