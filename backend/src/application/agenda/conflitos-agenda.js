function extrairDadosAgendaId(agendaId) {
  const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
    String(agendaId || "")
  );
  if (!parsed) return null;

  return {
    clinicaId: Number(parsed[1]),
    data: parsed[2],
    horario: `${parsed[3]}:${parsed[4]}`,
  };
}

function normalizarHorario(valor) {
  return String(valor || "").slice(0, 5);
}

function registroAtivo(registro) {
  const status = String(registro.status || "").toLowerCase();
  return !["cancelada", "cancelado"].includes(status);
}

function mesmoHorario(registro, dados) {
  if (!registroAtivo(registro)) return false;
  if (Number(registro.medico_id) !== Number(dados.medicoId)) return false;

  if (registro.agenda_id && dados.agendaId && String(registro.agenda_id) === String(dados.agendaId)) {
    return true;
  }

  return (
    String(registro.data || "") === String(dados.data || "") &&
    normalizarHorario(registro.horario) === normalizarHorario(dados.horario)
  );
}

async function listarPorClinica(repository, clinicaId) {
  if (!repository?.listarPorClinica) return [];
  const registros = await repository.listarPorClinica(clinicaId);
  return Array.isArray(registros) ? registros : [];
}

async function verificarConflitoAgenda({
  consultaRepository,
  exameRepository,
  clinicaId,
  medicoId,
  agendaId,
  data,
  horario,
}) {
  if (!clinicaId || !medicoId) return false;

  const dadosAgenda = extrairDadosAgendaId(agendaId);
  const dados = {
    medicoId,
    agendaId,
    data: data || dadosAgenda?.data || "",
    horario: horario || dadosAgenda?.horario || "",
  };

  if (!dados.agendaId && (!dados.data || !dados.horario || dados.horario === "-")) {
    return false;
  }

  const [consultas, exames] = await Promise.all([
    listarPorClinica(consultaRepository, clinicaId),
    listarPorClinica(exameRepository, clinicaId),
  ]);

  return [...consultas, ...exames].some((registro) => mesmoHorario(registro, dados));
}

module.exports = { verificarConflitoAgenda };
