const HORAS_ATENDIMENTO = [
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

function criarIdAgenda(clinicaId, data, hora) {
  const horaId = hora.replace(":", "");
  return `ag-${clinicaId}-${data}-t${horaId}`;
}

function extrairDadosAgendaId(agendaId) {
  const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(String(agendaId));
  if (!parsed) return null;

  return {
    clinicaId: parsed[1],
    data: parsed[2],
    hora: `${parsed[3]}:${parsed[4]}`,
  };
}

function criarAgendaRepositoryMemory() {
  const agendasReservadas = new Set();

  function montarSlots(clinicaId, data) {
    return HORAS_ATENDIMENTO.map((hora, index) => {
      const id = criarIdAgenda(clinicaId, data, hora);
      const reservado = agendasReservadas.has(id);

      return {
        id,
        hora,
        disponivel: !reservado,
        medico_id: 100 + (Number(clinicaId) % 4) * 10 + (index % 3),
      };
    });
  }

  return {
    async listarHorarios({ clinicaId, data, medicoId = null, especialidade = "" }) {
      let slots = montarSlots(String(clinicaId), String(data), String(especialidade));

      if (medicoId != null && medicoId !== "") {
        slots = slots.filter((slot) => Number(slot.medico_id) === Number(medicoId));
      }

      return slots;
    },

    async verificarDisponibilidade({ agendaId, especialidade = "" }) {
      const agenda = extrairDadosAgendaId(agendaId);
      if (!agenda) return { disponivel: false };

      const slots = montarSlots(agenda.clinicaId, agenda.data, especialidade);
      const slot = slots.find((item) => item.id === agendaId);

      return { disponivel: !!slot?.disponivel };
    },

    async reservar(agendaId) {
      agendasReservadas.add(String(agendaId));
    },

    async liberar(agendaId) {
      agendasReservadas.delete(String(agendaId));
    },
  };
}

module.exports = { criarAgendaRepositoryMemory };
