const CHAVE_EXAMES_AGENDADOS = "saude_plus_exames_agendados";

function lerExamesAgendados() {
  if (typeof window === "undefined") return [];

  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_EXAMES_AGENDADOS) || "[]");
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvarExamesAgendados(exames) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_EXAMES_AGENDADOS, JSON.stringify(exames));
}

async function listarExamesPaciente(pacienteId) {
  return lerExamesAgendados().filter(
    (exame) => Number(exame.paciente_id) === Number(pacienteId)
  );
}

async function criarAgendamentoExame(dadosExame) {
  const exames = lerExamesAgendados();
  const exame = {
    id: `exame-${Date.now()}`,
    paciente_id: dadosExame.pacienteId,
    clinica_id: dadosExame.clinicaId,
    clinica_nome: dadosExame.clinicaNome,
    clinica_bairro: dadosExame.clinicaBairro,
    tipo: dadosExame.tipo,
    data: dadosExame.data,
    horario: dadosExame.horario,
    observacoes: dadosExame.observacoes || "",
    status: "agendado",
    criado_em: new Date().toISOString(),
  };

  salvarExamesAgendados([...exames, exame]);
  return exame;
}

async function excluirExamePaciente(exameId) {
  const exames = lerExamesAgendados();
  salvarExamesAgendados(exames.filter((exame) => String(exame.id) !== String(exameId)));
}

export { criarAgendamentoExame, excluirExamePaciente, listarExamesPaciente };
