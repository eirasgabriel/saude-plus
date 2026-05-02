import {
  anexarResultadoExameApi,
  buscarExamesClinicaApi,
  buscarExamesPacienteApi,
  criarExameApi,
  excluirExameApi,
  salvarExamesClinicaApi,
} from "../../infrastructure/api/exames-api";
import { exibirNotificacaoSaudePlus } from "../../infrastructure/pwa/push-notifications";
import { notificarExamesAtualizados } from "./exames-eventos";

const CATEGORIAS_DOCUMENTO = {
  exame: "exame",
  prontuario: "prontuario",
  atestado: "atestado",
};

function normalizarCategoriaDocumento(categoria) {
  const chave = String(categoria || "").toLowerCase();
  return CATEGORIAS_DOCUMENTO[chave] || CATEGORIAS_DOCUMENTO.exame;
}

function destinoDownloadsCategoria(categoriaDocumento) {
  if (categoriaDocumento === "prontuario") return "prontuarios";
  if (categoriaDocumento === "atestado") return "atestados";
  return "exames";
}

function notificarArquivoDisponivel(exame, categoriaDocumento, tagPrefixo) {
  exibirNotificacaoSaudePlus({
    titulo:
      categoriaDocumento === "exame"
        ? "Resultado de exame disponivel"
        : "Documento disponivel",
    corpo: `${exame.tipo || "Seu documento"} foi anexado e ja pode ser baixado.`,
    url: `/paciente/downloads?categoria=${destinoDownloadsCategoria(categoriaDocumento)}`,
    tag: `${tagPrefixo}-${exame.id}`,
  });
}

function normalizarListaResultado(resultado) {
  return Array.isArray(resultado) ? resultado : [resultado];
}

async function listarExamesPaciente(pacienteId) {
  try {
    const dadosApi = await buscarExamesPacienteApi(pacienteId);
    return Array.isArray(dadosApi) ? dadosApi : [];
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel carregar os exames do paciente.");
  }
}

async function listarExamesClinica(clinicaId, medicoId = null) {
  try {
    const dadosApi = await buscarExamesClinicaApi(clinicaId, medicoId);
    return Array.isArray(dadosApi) ? dadosApi : [];
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel carregar os exames da clinica.");
  }
}

async function criarAgendamentoExame(dadosExame) {
  const exame = {
    paciente_id: dadosExame.pacienteId,
    medico_id: dadosExame.medicoId,
    agenda_id: dadosExame.agendaId,
    clinica_id: dadosExame.clinicaId,
    clinica_nome: dadosExame.clinicaNome,
    clinica_bairro: dadosExame.clinicaBairro,
    tipo: dadosExame.tipo,
    data: dadosExame.data,
    horario: dadosExame.horario,
    observacoes: dadosExame.observacoes || "",
    status: "agendado",
    resultado_disponivel: false,
    resultado_nome_arquivo: "",
    resultado_anexado_em: "",
  };

  try {
    const criado = await criarExameApi(exame);
    notificarExamesAtualizados();
    exibirNotificacaoSaudePlus({
      titulo: "Exame agendado",
      corpo: `${criado.tipo} em ${criado.data} as ${criado.horario}.`,
      url: "/paciente/exames",
      tag: `saude-plus-exame-${criado.id}`,
    });
    return criado;
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel agendar o exame.");
  }
}

async function anexarResultadoExame(exameId, dadosResultado = {}) {
  const categoriaDocumento = normalizarCategoriaDocumento(dadosResultado.categoriaDocumento);

  try {
    const atualizado = await anexarResultadoExameApi(exameId, {
      ...dadosResultado,
      categoriaDocumento,
    });
    const documentos = normalizarListaResultado(atualizado);
    notificarExamesAtualizados();
    if (documentos.length > 1) {
      exibirNotificacaoSaudePlus({
        titulo: "Documentos disponiveis",
        corpo: `${documentos.length} arquivos foram anexados e ja podem ser baixados.`,
        url: `/paciente/downloads?categoria=${destinoDownloadsCategoria(categoriaDocumento)}`,
        tag: `saude-plus-resultado-exame-${exameId}-${Date.now()}`,
      });
    } else {
      notificarArquivoDisponivel(documentos[0], categoriaDocumento, "saude-plus-resultado-exame");
    }
    return atualizado;
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel anexar o resultado do exame.");
  }
}

async function criarExameComArquivo(dadosExame) {
  const categoriaDocumento = normalizarCategoriaDocumento(dadosExame.categoriaDocumento);
  const agora = new Date().toISOString();
  const exame = {
    paciente_id: dadosExame.pacienteId,
    paciente: dadosExame.pacienteNome || "",
    clinica_id: dadosExame.clinicaId,
    clinica_nome: dadosExame.clinicaNome,
    clinica_bairro: dadosExame.clinicaBairro,
    tipo: dadosExame.tipo,
    data: dadosExame.data,
    horario: dadosExame.horario || "-",
    observacoes: dadosExame.observacoes || "",
    status: "liberado",
    resultado_disponivel: true,
    resultado_categoria: categoriaDocumento,
    resultado_nome_arquivo:
      dadosExame.nomeArquivo || `${dadosExame.tipo || "resultado"}-${Date.now()}`,
    resultado_descricao:
      dadosExame.descricao || `Arquivo anexado para ${dadosExame.tipo || "exame"}.`,
    resultado_anexado_em: agora,
    resultado_anexado_por: dadosExame.anexadoPor || "admin_clinica",
    resultado_anexado_por_nome: dadosExame.anexadoPorNome || "",
    resultado_arquivo_data_url: dadosExame.arquivoDataUrl || "",
    resultado_arquivo_tipo: dadosExame.tipoArquivo || "",
    resultado_arquivo_tamanho: Number(dadosExame.tamanhoArquivo || 0),
  };

  try {
    const criado = await criarExameApi(exame);
    notificarExamesAtualizados();
    notificarArquivoDisponivel(criado, categoriaDocumento, "saude-plus-upload-exame");
    return criado;
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel anexar o arquivo.");
  }
}

async function salvarExamesEmMassa(clinicaId, examesAtualizados) {
  try {
    const atualizados = await salvarExamesClinicaApi(clinicaId, examesAtualizados);
    notificarExamesAtualizados();
    return atualizados;
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel salvar os exames da clinica.");
  }
}

async function excluirExamePaciente(exameId) {
  try {
    await excluirExameApi(exameId);
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel remover o exame.");
  }

  notificarExamesAtualizados();
  exibirNotificacaoSaudePlus({
    titulo: "Exame removido",
    corpo: "Um exame foi removido da sua agenda.",
    url: "/paciente/exames",
    tag: `saude-plus-exame-removido-${exameId}`,
  });
}

export {
  anexarResultadoExame,
  criarExameComArquivo,
  criarAgendamentoExame,
  excluirExamePaciente,
  listarExamesClinica,
  listarExamesPaciente,
  salvarExamesEmMassa,
};
