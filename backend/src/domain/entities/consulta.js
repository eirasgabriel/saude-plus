const { AppError } = require("../errors/app-error");

function criarConsulta(dados) {
  const obrigatorios = ["paciente_id", "medico_id", "agenda_id", "clinica_id"];
  const faltando = obrigatorios.find((campo) => dados[campo] == null || dados[campo] === "");

  if (faltando) {
    throw new AppError(`Campo obrigatorio ausente: ${faltando}.`, 422, "CONSULTA_INVALIDA");
  }

  const agendaMatch = /^ag-\d+-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(String(dados.agenda_id));

  return {
    id: dados.id,
    paciente_id: Number(dados.paciente_id),
    medico_id: Number(dados.medico_id),
    agenda_id: String(dados.agenda_id),
    clinica_id: Number(dados.clinica_id),
    especialidade: dados.especialidade || "",
    observacoes: dados.observacoes || "",
    status: dados.status || "agendada",
    data: dados.data || agendaMatch?.[1],
    horario: dados.horario || (agendaMatch ? `${agendaMatch[2]}:${agendaMatch[3]}` : undefined),
    criado_em: dados.criado_em || new Date().toISOString(),
  };
}

module.exports = { criarConsulta };
