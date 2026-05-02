const { AppError } = require("../../domain/errors/app-error");
const { NIVEIS_ACESSO } = require("../../domain/value-objects/niveis-acesso");

async function buscarExamePorId(exameRepository, exameId) {
  if (exameRepository.buscarPorId) {
    return exameRepository.buscarPorId(exameId);
  }

  if (exameRepository.listarTodos) {
    const exames = await exameRepository.listarTodos();
    return exames.find((exame) => String(exame.id) === String(exameId)) || null;
  }

  return null;
}

function usuarioPodeExcluirExame(usuario, exame) {
  if (!usuario) return true;
  if (usuario.nivel_acesso === NIVEIS_ACESSO.ADMIN_MASTER) return true;

  return (
    usuario.nivel_acesso === NIVEIS_ACESSO.ADMIN_CLINICA &&
    Number(usuario.clinica_id) === Number(exame.clinica_id)
  );
}

async function liberarAgenda(agendaRepository, agendaId) {
  if (agendaId && agendaRepository?.liberar) {
    await agendaRepository.liberar(agendaId);
  }
}

function criarExcluirExame({ exameRepository, agendaRepository = null }) {
  return async function excluirExame(exameId, contexto = {}) {
    const exame = await buscarExamePorId(exameRepository, exameId);

    if (!exame) {
      throw new AppError("Exame nao encontrado.", 404, "EXAME_NAO_ENCONTRADO");
    }

    if (!usuarioPodeExcluirExame(contexto.usuario, exame)) {
      throw new AppError("Voce nao tem permissao para excluir este exame.", 403, "ACESSO_NEGADO");
    }

    const resultado = await exameRepository.excluir(exameId);
    await liberarAgenda(agendaRepository, exame.agenda_id);

    return resultado;
  };
}

module.exports = { criarExcluirExame };
