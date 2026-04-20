import { montarConsultasLocaisPaciente } from "../../domain/agenda/consultas-locais";
import {
  buscarConsultasClinicaApi,
  buscarConsultasPacienteApi,
  cancelarConsultaApi,
  criarConsultaApi,
  listarHorariosAgendaApi,
  verificarDisponibilidadeAgendaApi,
} from "../../infrastructure/api/agenda-api";

async function listarHorariosAgenda(clinicaId, data, medicoId = null, especialidade = "") {
  try {
    const dados = await listarHorariosAgendaApi(clinicaId, data, medicoId, especialidade);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel carregar os horarios. Tente novamente.");
  }
}

async function buscarHorariosDisponiveis(clinicaId, data, medicoId = null) {
  const horarios = await listarHorariosAgenda(clinicaId, data, medicoId);
  return horarios.filter((horario) => horario.disponivel);
}

async function criarAgendamento(dadosConsulta) {
  const { pacienteId, medicoId, agendaId, clinicaId, observacoes, especialidade } =
    dadosConsulta;

  try {
    const semConflito = await verificarConflito(medicoId, agendaId, especialidade || "");
    if (!semConflito) {
      throw new Error(
        "Este horario nao esta mais disponivel. Por favor, escolha outro."
      );
    }

    return criarConsultaApi({
      paciente_id: pacienteId,
      medico_id: medicoId,
      agenda_id: agendaId,
      clinica_id: clinicaId,
      observacoes,
      especialidade: especialidade || "",
      status: "agendada",
    });
  } catch (erro) {
    throw new Error(erro.message || "Falha ao agendar. Tente novamente.");
  }
}

async function verificarConflito(medicoId, agendaId, especialidade = "") {
  try {
    const dados = await verificarDisponibilidadeAgendaApi(medicoId, agendaId, especialidade);
    return dados.disponivel === true;
  } catch {
    return false;
  }
}

async function cancelarAgendamento(consultaId, motivo) {
  try {
    return cancelarConsultaApi(consultaId, motivo);
  } catch (erro) {
    throw new Error(erro.message || "Erro ao cancelar agendamento.");
  }
}

async function buscarHistoricoPaciente(pacienteId) {
  try {
    const dados = await buscarConsultasPacienteApi(pacienteId);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    console.warn("API de consultas indisponivel; usando consultas locais.", erro);
    return montarConsultasLocaisPaciente(pacienteId);
  }
}

async function buscarConsultasClinica(clinicaId) {
  try {
    const dados = await buscarConsultasClinicaApi(clinicaId);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel carregar as consultas da clinica.");
  }
}

export {
  listarHorariosAgenda,
  buscarHorariosDisponiveis,
  criarAgendamento,
  verificarConflito,
  cancelarAgendamento,
  buscarHistoricoPaciente,
  buscarConsultasClinica,
};
