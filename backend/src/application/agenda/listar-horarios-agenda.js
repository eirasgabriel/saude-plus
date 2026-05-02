const { AppError } = require("../../domain/errors/app-error");
const { verificarConflitoAgenda } = require("./conflitos-agenda");

function listarMedicosDaClinica(usuarios, clinicaId) {
  return usuarios
    .filter(
      (usuario) =>
        usuario.nivel_acesso === "medico" &&
        usuario.status !== "inativo" &&
        Number(usuario.clinica_id) === Number(clinicaId)
    )
    .sort((a, b) => Number(a.id) - Number(b.id));
}

function criarListarHorariosAgenda({
  agendaRepository,
  consultaRepository,
  exameRepository,
  usuarioRepository,
}) {
  return async function listarHorariosAgenda({ clinicaId, data, medicoId = null, especialidade = "" }) {
    if (!clinicaId || !data) {
      throw new AppError("Parametros clinica e data sao obrigatorios.", 400, "AGENDA_PARAMETROS_INVALIDOS");
    }

    const [slots, usuarios] = await Promise.all([
      agendaRepository.listarHorarios({
        clinicaId,
        data,
        especialidade,
      }),
      usuarioRepository.listar(),
    ]);
    const medicos = listarMedicosDaClinica(usuarios, clinicaId);

    if (medicos.length === 0) return [];

    const slotsComMedicos = slots
      .map((slot, index) => {
        const medico = medicos[index % medicos.length];
        return {
          ...slot,
          medico_id: Number(medico.id),
          medico: medico.nome,
        };
      })
      .filter((slot) => medicoId == null || medicoId === "" || Number(slot.medico_id) === Number(medicoId));

    return Promise.all(
      slotsComMedicos.map(async (slot) => {
        const conflito = await verificarConflitoAgenda({
          consultaRepository,
          exameRepository,
          clinicaId,
          medicoId: slot.medico_id,
          agendaId: slot.id,
          data,
          horario: slot.hora,
        });

        return {
          ...slot,
          disponivel: slot.disponivel && !conflito,
        };
      })
    );
  };
}

module.exports = { criarListarHorariosAgenda, listarMedicosDaClinica };
