import { requisitarJson } from "./http-client";

function montarQueryAgenda(clinicaId, data, medicoId = null, especialidade = "") {
  const params = new URLSearchParams({
    clinica: String(clinicaId),
    data,
  });

  if (especialidade) {
    params.set("especialidade", especialidade);
  }

  if (medicoId != null) {
    params.set("medico", String(medicoId));
  }

  return params.toString();
}

async function listarHorariosAgendaApi(clinicaId, data, medicoId = null, especialidade = "") {
  const query = montarQueryAgenda(clinicaId, data, medicoId, especialidade);
  return requisitarJson(`/api/agendas?${query}`);
}

async function verificarDisponibilidadeAgendaApi(medicoId, agendaId, especialidade = "") {
  const id = encodeURIComponent(String(agendaId));
  const params = new URLSearchParams({ medico: String(medicoId) });

  if (especialidade) {
    params.set("especialidade", especialidade);
  }

  return requisitarJson(`/api/agendas/${id}/verificar?${params.toString()}`);
}

async function criarConsultaApi(dadosConsulta) {
  return requisitarJson("/api/consultas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosConsulta),
  });
}

async function cancelarConsultaApi(consultaId, motivo) {
  return requisitarJson(`/api/consultas/${consultaId}/cancelar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo, status: "cancelada" }),
  });
}

async function buscarConsultasPacienteApi(pacienteId) {
  return requisitarJson(`/api/consultas?paciente=${encodeURIComponent(String(pacienteId))}`);
}

async function buscarConsultasClinicaApi(clinicaId) {
  return requisitarJson(`/api/consultas?clinica=${encodeURIComponent(String(clinicaId))}`);
}

export {
  buscarConsultasClinicaApi,
  listarHorariosAgendaApi,
  verificarDisponibilidadeAgendaApi,
  criarConsultaApi,
  cancelarConsultaApi,
  buscarConsultasPacienteApi,
};
