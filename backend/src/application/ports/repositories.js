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
 * - liberar(agendaId)
 *
 * ConsultaRepository:
 * - criar(consulta)
 * - buscarPorId(consultaId)
 * - listarPorPaciente(pacienteId)
 * - cancelar(consultaId, motivo)
 *
 * ExameRepository:
 * - criar(exame)
 * - buscarPorId(exameId)
 * - listarTodos()
 * - listarPorPaciente(pacienteId)
 * - listarPorClinica(clinicaId)
 * - atualizar(exameId, dados)
 * - excluir(exameId)
 */

module.exports = {};
