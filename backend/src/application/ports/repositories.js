/**
 * Portas esperadas pelos casos de uso.
 *
 * UsuarioRepository:
 * - buscarPorEmail(email)
 *
 * ClinicaRepository:
 * - listar()
 * - buscarPorId(id)
 *
 * AgendaRepository:
 * - listarHorarios({ clinicaId, data, medicoId, especialidade })
 * - verificarDisponibilidade({ agendaId, medicoId, especialidade })
 * - reservar(agendaId)
 *
 * ConsultaRepository:
 * - criar(consulta)
 * - listarPorPaciente(pacienteId)
 * - cancelar(consultaId, motivo)
 */

module.exports = {};
