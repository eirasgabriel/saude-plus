function filtrarPacientesCadastrados(registros, usuarios) {
  const pacientesCadastrados = new Map(
    usuarios
      .filter((usuario) => usuario.nivel_acesso === "paciente")
      .map((usuario) => [Number(usuario.id), usuario])
  );

  const medicosCadastrados = new Map(
    usuarios
      .filter((usuario) => usuario.nivel_acesso === "medico")
      .map((usuario) => [Number(usuario.id), usuario])
  );

  return registros
    .filter((registro) => pacientesCadastrados.has(Number(registro.paciente_id)))
    .map((registro) => {
      const paciente = pacientesCadastrados.get(Number(registro.paciente_id));
      const medico = medicosCadastrados.get(Number(registro.medico_id));

      return {
        ...registro,
        paciente: paciente?.nome || registro.paciente || "",
        medico: medico?.nome || registro.medico || "",
      };
    });
}

function filtrarPorMedico(registros, medicoId) {
  if (medicoId == null || medicoId === "") return registros;
  return registros.filter((registro) => Number(registro.medico_id) === Number(medicoId));
}

function criarListarConsultasClinica({ consultaRepository, usuarioRepository }) {
  return async function listarConsultasClinica(clinicaId, opcoes = {}) {
    if (!clinicaId) return [];
    const deveFiltrarMedico = opcoes.medicoId != null && opcoes.medicoId !== "";
    const listarConsultas = deveFiltrarMedico && consultaRepository.listarPorClinicaEMedico
      ? consultaRepository.listarPorClinicaEMedico(clinicaId, opcoes.medicoId)
      : consultaRepository.listarPorClinica(clinicaId);
    const [consultas, usuarios] = await Promise.all([
      listarConsultas,
      usuarioRepository.listar(),
    ]);
    return filtrarPacientesCadastrados(filtrarPorMedico(consultas, opcoes.medicoId), usuarios);
  };
}

module.exports = { criarListarConsultasClinica };
