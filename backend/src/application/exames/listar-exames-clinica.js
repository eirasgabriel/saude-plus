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

function criarListarExamesClinica({ exameRepository, usuarioRepository }) {
  return async function listarExamesClinica(clinicaId, opcoes = {}) {
    if (!clinicaId) return [];
    const deveFiltrarMedico = opcoes.medicoId != null && opcoes.medicoId !== "";
    const listarExames = deveFiltrarMedico && exameRepository.listarPorClinicaEMedico
      ? exameRepository.listarPorClinicaEMedico(clinicaId, opcoes.medicoId)
      : exameRepository.listarPorClinica(clinicaId);
    const [exames, usuarios] = await Promise.all([
      listarExames,
      usuarioRepository.listar(),
    ]);
    return filtrarPacientesCadastrados(filtrarPorMedico(exames, opcoes.medicoId), usuarios);
  };
}

module.exports = { criarListarExamesClinica };
