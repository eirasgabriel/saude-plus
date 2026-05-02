const { listarMedicosDaClinica } = require("./listar-horarios-agenda");
const { verificarConflitoAgenda } = require("./conflitos-agenda");

function extrairClinicaIdAgenda(agendaId) {
  const parsed = /^ag-(\d+)-\d{4}-\d{2}-\d{2}-t\d{4}$/.exec(String(agendaId || ""));
  return parsed ? Number(parsed[1]) : null;
}

function criarVerificarDisponibilidade({
  agendaRepository,
  consultaRepository,
  exameRepository,
  usuarioRepository,
}) {
  return async function verificarDisponibilidade({ agendaId, medicoId, especialidade = "" }) {
    const clinicaId = extrairClinicaIdAgenda(agendaId);
    if (!clinicaId || !medicoId) {
      return { disponivel: false };
    }

    const usuarios = await usuarioRepository.listar();
    const medicos = listarMedicosDaClinica(usuarios, clinicaId);
    const medicoCadastrado = medicos.some((medico) => Number(medico.id) === Number(medicoId));

    if (!medicoCadastrado) {
      return { disponivel: false };
    }

    const disponibilidade = await agendaRepository.verificarDisponibilidade({
      agendaId,
      especialidade,
    });

    if (!disponibilidade.disponivel) {
      return disponibilidade;
    }

    const conflito = await verificarConflitoAgenda({
      consultaRepository,
      exameRepository,
      clinicaId,
      medicoId,
      agendaId,
    });

    return { disponivel: !conflito };
  };
}

module.exports = { criarVerificarDisponibilidade };
