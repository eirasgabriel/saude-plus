const { AppError } = require("../../domain/errors/app-error");
const { NIVEIS_ACESSO } = require("../../domain/value-objects/niveis-acesso");
const { normalizarCategoriaDocumento } = require("../../domain/entities/exame");

const TAMANHO_MAXIMO_ARQUIVO_BYTES = 2 * 1024 * 1024;
const TAMANHO_MAXIMO_DATA_URL = 3 * 1024 * 1024;

function normalizarArquivosResultado(dadosResultado = {}) {
  if (Array.isArray(dadosResultado.arquivos) && dadosResultado.arquivos.length > 0) {
    return dadosResultado.arquivos;
  }

  return [
    {
      categoriaDocumento: dadosResultado.categoriaDocumento,
      nomeArquivo: dadosResultado.nomeArquivo,
      arquivoDataUrl: dadosResultado.arquivoDataUrl,
      tipoArquivo: dadosResultado.tipoArquivo,
      tamanhoArquivo: dadosResultado.tamanhoArquivo,
      descricao: dadosResultado.descricao,
    },
  ];
}

function montarPayloadResultado(exame, dadosResultado, arquivo) {
  const categoriaDocumento = normalizarCategoriaDocumento(
    arquivo.categoriaDocumento || dadosResultado.categoriaDocumento
  );
  const agora = new Date().toISOString();

  return {
    status: "liberado",
    resultado_disponivel: true,
    resultado_categoria: categoriaDocumento,
    resultado_nome_arquivo:
      arquivo.nomeArquivo || `${exame.tipo || "resultado"}-${exame.id}.pdf`,
    resultado_descricao:
      arquivo.descricao ||
      dadosResultado.descricao ||
      `Resultado anexado para ${exame.tipo || "exame"}.`,
    resultado_anexado_em: agora,
    resultado_anexado_por: dadosResultado.anexadoPor || "admin_clinica",
    resultado_anexado_por_nome: dadosResultado.anexadoPorNome || "",
    resultado_arquivo_data_url: arquivo.arquivoDataUrl || "",
    resultado_arquivo_tipo: arquivo.tipoArquivo || "",
    resultado_arquivo_tamanho: Number(arquivo.tamanhoArquivo || 0),
  };
}

function validarArquivoResultado(arquivo = {}) {
  if (!arquivo.arquivoDataUrl && !arquivo.nomeArquivo) {
    throw new AppError("Informe ao menos um arquivo para anexar ao resultado.", 422, "ARQUIVO_INVALIDO");
  }

  const tamanhoArquivo = Number(arquivo.tamanhoArquivo || 0);
  if (tamanhoArquivo > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
    throw new AppError("O arquivo do resultado excede 2 MB.", 413, "ARQUIVO_MUITO_GRANDE");
  }

  if (String(arquivo.arquivoDataUrl || "").length > TAMANHO_MAXIMO_DATA_URL) {
    throw new AppError("O arquivo do resultado excede o tamanho permitido.", 413, "ARQUIVO_MUITO_GRANDE");
  }
}

function usuarioPodeAnexarResultado(usuario, exame) {
  if (!usuario) return true;

  if (usuario.nivel_acesso === NIVEIS_ACESSO.ADMIN_MASTER) return true;

  if (usuario.nivel_acesso === NIVEIS_ACESSO.ADMIN_CLINICA) {
    return Number(usuario.clinica_id) === Number(exame.clinica_id);
  }

  if (usuario.nivel_acesso === NIVEIS_ACESSO.MEDICO) {
    const mesmaClinica = Number(usuario.clinica_id) === Number(exame.clinica_id);
    const mesmoMedico =
      exame.medico_id == null || Number(usuario.id) === Number(exame.medico_id);
    return mesmaClinica && mesmoMedico;
  }

  return false;
}

function criarAnexarResultadoExame({ exameRepository }) {
  return async function anexarResultadoExame({ exameId, dadosResultado }, contexto = {}) {
    const todos = await exameRepository.listarTodos();
    const exame = todos.find((item) => String(item.id) === String(exameId));

    if (!exame) {
      throw new AppError("Exame nao encontrado para anexar resultado.", 404, "EXAME_NAO_ENCONTRADO");
    }

    if (!usuarioPodeAnexarResultado(contexto.usuario, exame)) {
      throw new AppError("Voce nao tem permissao para anexar resultado neste exame.", 403, "ACESSO_NEGADO");
    }

    const arquivos = normalizarArquivosResultado(dadosResultado);
    arquivos.forEach(validarArquivoResultado);
    const [primeiroArquivo, ...arquivosExtras] = arquivos;
    const exameAtualizado = await exameRepository.atualizar(
      exameId,
      montarPayloadResultado(exame, dadosResultado, primeiroArquivo)
    );

    if (!exameAtualizado) {
      throw new AppError("Exame nao encontrado para anexar resultado.", 404, "EXAME_NAO_ENCONTRADO");
    }

    const documentosExtras = await Promise.all(
      arquivosExtras.map((arquivo, indice) =>
        exameRepository.criar({
          ...exame,
          id: `${exame.id}-arquivo-${Date.now()}-${indice + 1}`,
          ...montarPayloadResultado(exame, dadosResultado, arquivo),
          criado_em: new Date().toISOString(),
        })
      )
    );

    const documentos = [exameAtualizado, ...documentosExtras];
    return documentos.length === 1 ? exameAtualizado : documentos;
  };
}

module.exports = { criarAnexarResultadoExame };
