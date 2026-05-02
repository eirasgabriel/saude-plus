import { exibirNotificacaoSaudePlus } from "../../infrastructure/pwa/push-notifications";
import { notificarConsultasAtualizadas } from "./consultas-eventos";
import {
  buscarConsultasClinicaApi,
  buscarConsultasPacienteApi,
  cancelarConsultaApi,
  criarConsultaApi,
  listarHorariosAgendaApi,
  verificarDisponibilidadeAgendaApi,
} from "../../infrastructure/api/agenda-api";
import { criarExameApi } from "../../infrastructure/api/exames-api";

const CATEGORIAS_ANEXO_CONSULTA = {
  prontuario: "prontuario",
  atestado: "atestado",
};

function normalizarCategoriaAnexoConsulta(categoria) {
  const chave = String(categoria || "").toLowerCase();
  return CATEGORIAS_ANEXO_CONSULTA[chave] || CATEGORIAS_ANEXO_CONSULTA.prontuario;
}

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

    const resposta = await criarConsultaApi({
      paciente_id: pacienteId,
      medico_id: medicoId,
      agenda_id: agendaId,
      clinica_id: clinicaId,
      observacoes,
      especialidade: especialidade || "",
      status: "agendada",
    });
    const consulta = resposta?.consulta || resposta;

    if (!consulta?.id) {
      throw new Error("A API nao confirmou o registro da consulta.");
    }

    const consultasPaciente = await buscarConsultasPacienteApi(pacienteId);
    const consultaPersistida = (Array.isArray(consultasPaciente) ? consultasPaciente : []).some(
      (item) =>
        String(item.id) === String(consulta.id) ||
        String(item.agenda_id || "") === String(agendaId)
    );

    if (!consultaPersistida) {
      throw new Error(
        "A consulta foi recebida pela API, mas nao foi encontrada nos registros. Tente novamente."
      );
    }

    notificarConsultasAtualizadas();
    const agenda = parseAgendaId(agendaId);
    exibirNotificacaoSaudePlus({
      titulo: "Consulta agendada",
      corpo: agenda
        ? `Sua consulta foi agendada para ${agenda.data} as ${agenda.hora}.`
        : "Sua consulta foi agendada com sucesso.",
      url: "/paciente/consultas",
      tag: `saude-plus-consulta-${agendaId}`,
    });
    return consulta;
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
    const resultado = await cancelarConsultaApi(consultaId, motivo);
    notificarConsultasAtualizadas();
    exibirNotificacaoSaudePlus({
      titulo: "Consulta cancelada",
      corpo: "Sua consulta foi cancelada. Voce pode agendar um novo horario.",
      url: "/paciente/consultas",
      tag: `saude-plus-consulta-cancelada-${consultaId}`,
    });
    return resultado;
  } catch (erro) {
    throw new Error(erro.message || "Erro ao cancelar agendamento.");
  }
}

function parseAgendaId(agendaId) {
  const parsed = /^ag-\d+-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
    String(agendaId || "")
  );
  if (!parsed) return null;

  return {
    data: parsed[1],
    hora: `${parsed[2]}:${parsed[3]}`,
  };
}

async function buscarHistoricoPaciente(pacienteId) {
  try {
    const dados = await buscarConsultasPacienteApi(pacienteId);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel carregar o historico do paciente.");
  }
}

async function buscarConsultasClinica(clinicaId, medicoId = null) {
  try {
    const dados = await buscarConsultasClinicaApi(clinicaId, medicoId);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel carregar as consultas da clinica.");
  }
}

async function anexarArquivoConsulta(consulta, dadosArquivo = {}) {
  if (!consulta) {
    throw new Error("Consulta nao encontrada para anexar arquivo.");
  }

  const categoria = normalizarCategoriaAnexoConsulta(dadosArquivo.categoriaDocumento);
  const agenda = parseAgendaId(consulta.agenda_id);
  const data = consulta.data || consulta.data_consulta || agenda?.data || "";
  const horario = consulta.horario || consulta.hora || agenda?.hora || "";
  const agora = new Date().toISOString();
  const tituloPadrao = categoria === "atestado" ? "Atestado" : "Prontuario";
  const arquivos = Array.isArray(dadosArquivo.arquivos) && dadosArquivo.arquivos.length > 0
    ? dadosArquivo.arquivos
    : [
        {
          nomeArquivo: dadosArquivo.nomeArquivo,
          arquivoDataUrl: dadosArquivo.arquivoDataUrl,
          tipoArquivo: dadosArquivo.tipoArquivo,
          tamanhoArquivo: dadosArquivo.tamanhoArquivo,
        },
      ];
  const documentos = await Promise.all(
    arquivos.map((arquivo, indice) =>
      criarExameApi({
        consulta_id: consulta.id,
        paciente_id: consulta.paciente_id,
        paciente: consulta.paciente || "",
        clinica_id: consulta.clinica_id,
        clinica: consulta.clinica || consulta.clinica_nome || "Clinica nao identificada",
        tipo:
          dadosArquivo.titulo ||
          `${tituloPadrao} - ${consulta.especialidade || "Atendimento"}${
            arquivos.length > 1 ? ` ${indice + 1}` : ""
          }`,
        data,
        horario,
        medico: consulta.medico || "",
        medico_id: consulta.medico_id,
        especialidade: consulta.especialidade || "Atendimento",
        status: "liberado",
        resultado_disponivel: true,
        resultado_categoria: categoria,
        resultado_nome_arquivo:
          arquivo.nomeArquivo || `${categoria}-${consulta.id || Date.now()}-${indice + 1}`,
        resultado_descricao: dadosArquivo.descricao || `${tituloPadrao} anexado pela unidade.`,
        resultado_anexado_em: agora,
        resultado_anexado_por: dadosArquivo.anexadoPor || "admin_clinica",
        resultado_anexado_por_nome: dadosArquivo.anexadoPorNome || "Admin da clinica",
        resultado_arquivo_data_url: arquivo.arquivoDataUrl || "",
        resultado_arquivo_tipo: arquivo.tipoArquivo || "",
        resultado_arquivo_tamanho: Number(arquivo.tamanhoArquivo || 0),
        criado_em: agora,
      })
    )
  );

  notificarConsultasAtualizadas();
  exibirNotificacaoSaudePlus({
    titulo: categoria === "atestado" ? "Atestado disponivel" : "Prontuario disponivel",
    corpo:
      documentos.length > 1
        ? `${documentos.length} arquivos ja podem ser baixados.`
        : `${documentos[0].tipo} ja pode ser baixado.`,
    url: `/paciente/downloads?categoria=${
      categoria === "atestado" ? "atestados" : "prontuarios"
    }`,
    tag: `saude-plus-consulta-anexo-${consulta.id}-${Date.now()}`,
  });

  return documentos.length === 1 ? documentos[0] : documentos;
}

export {
  anexarArquivoConsulta,
  listarHorariosAgenda,
  buscarHorariosDisponiveis,
  criarAgendamento,
  verificarConflito,
  cancelarAgendamento,
  buscarHistoricoPaciente,
  buscarConsultasClinica,
};
