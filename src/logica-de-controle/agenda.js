
// LÓGICA DE AGENDAMENTO — Saúde+
// Controla criação, cancelamento e verificação de consultas
// Aplica RN1: Conflito zero de horários

/**
 * Busca os horários disponíveis de uma clínica
 * @param {number} clinicaId - ID da clínica
 * @param {string} data - Data no formato YYYY-MM-DD
 * @param {number} [medicoId] - Filtra por médico específico (opcional)
 * @returns {Array} Lista de horários disponíveis
 */
async function buscarHorariosDisponiveis(clinicaId, data, medicoId = null) {
  try {
    // Monta a URL com os filtros necessários
    let url = `/api/agendas?clinica=${clinicaId}&data=${data}`;
    if (medicoId) url += `&medico=${medicoId}`;

    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Retorna apenas horários com disponível = true
    return dados.filter((horario) => horario.disponivel);
  } catch (erro) {
    throw new Error("Não foi possível carregar os horários. Tente novamente.");
  }
}

/**
 * Cria um novo agendamento
 * Verifica conflito de horário antes de confirmar (RN1)
 * @param {object} dadosConsulta - Dados da consulta a ser agendada
 * @returns {object} Consulta criada
 */
async function criarAgendamento(dadosConsulta) {
  const { pacienteId, medicoId, agendaId, clinicaId, observacoes } = dadosConsulta;

  try {
    // Verifica conflito de horário antes de salvar (RN1: conflito zero)
    const semConflito = await verificarConflito(medicoId, agendaId);
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
        status: "agendada",
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.mensagem || "Erro ao realizar agendamento.");
    }

    return await resposta.json();
  } catch (erro) {
    throw new Error(erro.message || "Falha ao agendar. Tente novamente.");
  }
}

/**
 * Verifica se um horário ainda está disponível (previne conflito — RN1)
 * @param {number} medicoId - ID do médico
 * @param {number} agendaId - ID do horário
 * @returns {boolean} true = sem conflito, pode agendar
 */
async function verificarConflito(medicoId, agendaId) {
  try {
    const resposta = await fetch(
      `/api/agendas/${agendaId}/verificar?medico=${medicoId}`
    );
    const dados = await resposta.json();
    return dados.disponivel === true;
  } catch {
    // Em caso de erro de rede, bloqueia o agendamento por segurança
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
    const resposta = await fetch(`/api/consultas/${consultaId}/cancelar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo, status: "cancelada" }),
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível cancelar. Tente novamente.");
    }

    return await resposta.json();
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
    return await resposta.json();
  } catch (erro) {
    throw new Error("Erro ao carregar seu histórico de consultas.");
  }
}

module.exports = {
  buscarHorariosDisponiveis,
  criarAgendamento,
  verificarConflito,
  cancelarAgendamento,
  buscarHistoricoPaciente,
};
