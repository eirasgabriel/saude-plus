function criarListarExamesPaciente({ exameRepository, usuarioRepository }) {
  return async function listarExamesPaciente(pacienteId) {
    if (!pacienteId) return [];
    const paciente = await usuarioRepository.buscarPorId(pacienteId);
    if (!paciente || paciente.nivel_acesso !== "paciente") return [];
    const [exames, usuarios] = await Promise.all([
      exameRepository.listarPorPaciente(pacienteId),
      usuarioRepository.listar(),
    ]);
    const medicos = new Map(
      usuarios
        .filter((usuario) => usuario.nivel_acesso === "medico")
        .map((usuario) => [Number(usuario.id), usuario])
    );

    return exames.map((exame) => {
      const medico = medicos.get(Number(exame.medico_id));
      return {
        ...exame,
        paciente: paciente.nome,
        medico: medico?.nome || exame.medico || "",
      };
    });
  };
}

module.exports = { criarListarExamesPaciente };
