
// LÓGICA DE AGENDAMENTO — Saúde+
// Controla criação, cancelamento e verificação de consultas
// Aplica RN1: Conflito zero de horários

/**
 * Lê o corpo da resposta como JSON sem falhar com "Unexpected token '<'".
 * Quando o servidor devolve HTML (ex.: index.html ou 404 em página), mostra mensagem útil.
 * @param {Response} resposta
 * @returns {Promise<object|Array>}
 */
async function parseJsonResposta(resposta) {
  const texto = await resposta.text();
  const t = texto.trim();
  if (!t) {
    return {};
  }
  if (t.startsWith("<") || t.startsWith("<!")) {
    throw new Error(
      "O servidor devolveu HTML em vez de JSON. Use npm run iniciar para o mock de API em desenvolvimento ou configure um backend em /api."
    );
  }
  try {
    return JSON.parse(texto);
  } catch {
    throw new Error("Resposta do servidor em formato inesperado.");
  }
}

/**
 * Lista todos os horários retornados pela API (livres e ocupados).
 * Útil para montar a grade na tela de agendamento.
 * @param {number|string} clinicaId
 * @param {string} data - YYYY-MM-DD
 * @param {number|null} [medicoId]
 * @param {string} [especialidade] - usada pelo mock para variar slots
 * @returns {Promise<Array<{ id, hora, disponivel, medico_id }>>}
 */
async function listarHorariosAgenda(clinicaId, data, medicoId = null, especialidade = "") {
  try {
    let url = `/api/agendas?clinica=${encodeURIComponent(String(clinicaId))}&data=${encodeURIComponent(data)}`;
    if (especialidade) {
      url += `&especialidade=${encodeURIComponent(especialidade)}`;
    }
    if (medicoId != null) {
      url += `&medico=${encodeURIComponent(String(medicoId))}`;
    }

    const resposta = await fetch(url);
    const dados = await parseJsonResposta(resposta);
    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao carregar horários.");
    }
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    throw new Error(erro.message || "Não foi possível carregar os horários. Tente novamente.");
  }
}

/**
 * Busca os horários disponíveis de uma clínica
 * @param {number} clinicaId - ID da clínica
 * @param {string} data - Data no formato YYYY-MM-DD
 * @param {number} [medicoId] - Filtra por médico específico (opcional)
 * @returns {Array} Lista de horários disponíveis
 */
async function buscarHorariosDisponiveis(clinicaId, data, medicoId = null) {
  try {
    let url = `/api/agendas?clinica=${clinicaId}&data=${data}`;
    if (medicoId) url += `&medico=${medicoId}`;

    const resposta = await fetch(url);
    const dados = await parseJsonResposta(resposta);

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao carregar horários.");
    }

    const lista = Array.isArray(dados) ? dados : [];
    return lista.filter((horario) => horario.disponivel);
  } catch (erro) {
    throw new Error(erro.message || "Não foi possível carregar os horários. Tente novamente.");
  }
}

/**
 * Cria um novo agendamento
 * Verifica conflito de horário antes de confirmar (RN1)
 * @param {object} dadosConsulta - Dados da consulta a ser agendada
 * @returns {object} Consulta criada
 */
async function criarAgendamento(dadosConsulta) {
  const { pacienteId, medicoId, agendaId, clinicaId, observacoes, especialidade } =
    dadosConsulta;

  try {
    const semConflito = await verificarConflito(
      medicoId,
      agendaId,
      especialidade || ""
    );
    if (!semConflito) {
      throw new Error(
        "Este horário não está mais disponível. Por favor, escolha outro."
      );
    }

    const resposta = await fetch("/api/consultas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paciente_id: pacienteId,
        medico_id: medicoId,
        agenda_id: agendaId,
        clinica_id: clinicaId,
        observacoes,
        especialidade: especialidade || "",
        status: "agendada",
      }),
    });

    const dados = await parseJsonResposta(resposta);

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao realizar agendamento.");
    }

    return dados;
  } catch (erro) {
    throw new Error(erro.message || "Falha ao agendar. Tente novamente.");
  }
}

/**
 * Verifica se um horário ainda está disponível (previne conflito — RN1)
 * @param {number} medicoId - ID do médico
 * @param {string|number} agendaId - ID do horário
 * @param {string} [especialidade] - alinhado ao mock / API de agendas
 * @returns {boolean} true = sem conflito, pode agendar
 */
async function verificarConflito(medicoId, agendaId, especialidade = "") {
  try {
    const id = encodeURIComponent(String(agendaId));
    let url = `/api/agendas/${id}/verificar?medico=${encodeURIComponent(String(medicoId))}`;
    if (especialidade) {
      url += `&especialidade=${encodeURIComponent(especialidade)}`;
    }
    const resposta = await fetch(url);
    const dados = await parseJsonResposta(resposta);
    return dados.disponivel === true;
  } catch {
    return false;
  }
}

/**
 * Cancela uma consulta agendada
 * @param {number} consultaId - ID da consulta
 * @param {string} motivo - Motivo do cancelamento
 * @returns {object} Confirmação do cancelamento
 */
async function cancelarAgendamento(consultaId, motivo) {
  try {
    const resposta = await fetch(
      `/api/consultas/${consultaId}/cancelar`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo, status: "cancelada" }),
      }
    );
    const dados = await parseJsonResposta(resposta);
    if (!resposta.ok) {
      throw new Error(
        dados.mensagem || "Não foi possível cancelar. Tente novamente."
      );
    }
    return dados;
  } catch (erro) {
    throw new Error(erro.message || "Erro ao cancelar agendamento.");
  }
}

/**
 * Busca o histórico de consultas do paciente
 * @param {number} pacienteId - ID do paciente
 * @returns {Array} Lista de consultas
 */
async function buscarHistoricoPaciente(pacienteId) {
  try {
    const resposta = await fetch(`/api/consultas?paciente=${pacienteId}`);
    const dados = await parseJsonResposta(resposta);
    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Erro ao carregar histórico.");
    }
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    throw new Error(erro.message || "Erro ao carregar seu histórico de consultas.");
  }
}

export {
  listarHorariosAgenda,
  buscarHorariosDisponiveis,
  criarAgendamento,
  verificarConflito,
  cancelarAgendamento,
  buscarHistoricoPaciente,
};
