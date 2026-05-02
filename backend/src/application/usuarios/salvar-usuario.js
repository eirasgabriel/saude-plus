const { AppError } = require("../../domain/errors/app-error");
const { NIVEIS_ACESSO } = require("../../domain/value-objects/niveis-acesso");
const validar = require("../../infrastructure/security/validacao");

function criarSalvarUsuario({ usuarioRepository }) {
  return async function salvarUsuario(dados, contexto = {}) {
    if (!dados.nome || !dados.email || (!dados.nivel_acesso && !dados.id)) {
      throw new AppError("Nome, email e nivel de acesso sao obrigatorios.", 422, "USUARIO_INVALIDO");
    }

    const email = validar.email(dados.email);
    const usuarioAutenticado = contexto.usuario || null;
    const criandoUsuario = !dados.id;
    const usuarioExistente = dados.id ? await usuarioRepository.buscarPorId(dados.id) : null;
    const nivelAcesso = String(dados.nivel_acesso || usuarioExistente?.nivel_acesso || "");

    if (!Object.values(NIVEIS_ACESSO).includes(nivelAcesso)) {
      throw new AppError("Nivel de acesso invalido.", 422, "NIVEL_ACESSO_INVALIDO");
    }

    if (!usuarioAutenticado && nivelAcesso !== NIVEIS_ACESSO.PACIENTE) {
      throw new AppError("Cadastro publico permitido apenas para pacientes.", 403, "ACESSO_NEGADO");
    }

    if (usuarioAutenticado && usuarioAutenticado.nivel_acesso !== NIVEIS_ACESSO.ADMIN_MASTER) {
      if (String(usuarioAutenticado.id) !== String(dados.id)) {
        throw new AppError("Voce nao tem permissao para alterar este usuario.", 403, "ACESSO_NEGADO");
      }
    }

    if (dados.id && !usuarioExistente) {
      throw new AppError("Usuario nao encontrado.", 404, "USUARIO_NAO_ENCONTRADO");
    }

    const usuarioComMesmoEmail = await usuarioRepository.buscarPorEmail(email);

    if (
      usuarioComMesmoEmail &&
      (!dados.id || Number(usuarioComMesmoEmail.id) !== Number(dados.id))
    ) {
      throw new AppError("Ja existe um usuario cadastrado com este email.", 409, "EMAIL_DUPLICADO");
    }

    const podeAlterarCamposSensiveis =
      usuarioAutenticado?.nivel_acesso === NIVEIS_ACESSO.ADMIN_MASTER;
    const cadastroPublicoPaciente = !usuarioAutenticado && criandoUsuario;

    const payload = {
      nome: validar.texto(dados.nome, "Nome", { min: 2, max: 120 }),
      email,
      nivel_acesso: podeAlterarCamposSensiveis
        ? nivelAcesso
        : usuarioExistente?.nivel_acesso || NIVEIS_ACESSO.PACIENTE,
      clinica_id: podeAlterarCamposSensiveis
        ? dados.clinica_id
          ? Number(dados.clinica_id)
          : null
        : usuarioExistente?.clinica_id ?? null,
      status: podeAlterarCamposSensiveis
        ? dados.status || usuarioExistente?.status || "ativo"
        : usuarioExistente?.status || "ativo",
    };

    if (cadastroPublicoPaciente) {
      payload.nivel_acesso = NIVEIS_ACESSO.PACIENTE;
      payload.clinica_id = null;
      payload.status = "ativo";
    }

    if (dados.cpf) {
      payload.cpf = String(dados.cpf).replace(/\D/g, "");
    }

    if (dados.telefone) {
      payload.telefone = String(dados.telefone).replace(/\D/g, "");
    }

    if (dados.cep) {
      payload.cep = String(dados.cep).replace(/\D/g, "");
    }

    for (const campo of ["endereco", "bairro", "cidade", "estado"]) {
      if (dados[campo]) {
        payload[campo] = String(dados[campo]).trim();
      }
    }

    if (dados.senha) {
      payload.senha = validar.senha(dados.senha);
    }

    if (dados.id) {
      const usuario = await usuarioRepository.atualizar(dados.id, payload);
      return usuario;
    }

    if (!payload.senha) {
      throw new AppError("Senha inicial e obrigatoria para novos usuarios.", 422, "SENHA_OBRIGATORIA");
    }

    return usuarioRepository.salvar(payload);
  };
}

module.exports = { criarSalvarUsuario };
