function criarListarConsultasPaciente({ consultaRepository, usuarioRepository }) {
  return async function listarConsultasPaciente(pacienteId) {
    if (!pacienteId) return [];
    const paciente = await usuarioRepository.buscarPorId(pacienteId);
    if (!paciente || paciente.nivel_acesso !== "paciente") return [];
    const [consultas, usuarios] = await Promise.all([
      consultaRepository.listarPorPaciente(pacienteId),
      usuarioRepository.listar(),
    ]);
    const medicos = new Map(
      usuarios
        .filter((usuario) => usuario.nivel_acesso === "medico")
        .map((usuario) => [Number(usuario.id), usuario])
    );

    return consultas.map((consulta) => {
      const medico = medicos.get(Number(consulta.medico_id));
      return {
        ...consulta,
        paciente: paciente.nome,
        medico: medico?.nome || consulta.medico || "",
      };
    });
  };
}

module.exports = { criarListarConsultasPaciente };
