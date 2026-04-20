function formatarDataIso(data) {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, "0");
  const d = String(data.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dataDaquiHa(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return formatarDataIso(data);
}

function criarAgendaIdLocal(clinicaId, data, hora) {
  return `ag-${clinicaId}-${data}-t${hora.replace(":", "")}`;
}

function montarConsultasLocaisPaciente(pacienteId) {
  const consultaAmanha = dataDaquiHa(1);
  const consultaSemana = dataDaquiHa(6);

  return [
    {
      id: "local-101",
      paciente_id: Number(pacienteId),
      medico_id: 110,
      agenda_id: criarAgendaIdLocal(1, consultaAmanha, "08:30"),
      clinica_id: 1,
      especialidade: "Clinica Geral",
      observacoes: "Retorno de rotina",
      status: "agendada",
      criado_em: new Date().toISOString(),
    },
    {
      id: "local-102",
      paciente_id: Number(pacienteId),
      medico_id: 120,
      agenda_id: criarAgendaIdLocal(2, consultaSemana, "10:00"),
      clinica_id: 2,
      especialidade: "Ginecologia",
      observacoes: "Consulta preventiva",
      status: "confirmada",
      criado_em: new Date().toISOString(),
    },
  ];
}

export { montarConsultasLocaisPaciente };
