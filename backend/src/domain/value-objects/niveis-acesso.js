const NIVEIS_ACESSO = Object.freeze({
  ADMIN_MASTER: "admin_master",
  ADMIN_CLINICA: "admin_clinica",
  MEDICO: "medico",
  PACIENTE: "paciente",
});

const HIERARQUIA_ACESSO = Object.freeze([
  NIVEIS_ACESSO.PACIENTE,
  NIVEIS_ACESSO.MEDICO,
  NIVEIS_ACESSO.ADMIN_CLINICA,
  NIVEIS_ACESSO.ADMIN_MASTER,
]);

function temNivelNecessario(usuario, nivelNecessario) {
  if (!usuario || !nivelNecessario) return false;

  const posicaoUsuario = HIERARQUIA_ACESSO.indexOf(usuario.nivel_acesso);
  const posicaoNecessaria = HIERARQUIA_ACESSO.indexOf(nivelNecessario);

  return posicaoUsuario >= 0 && posicaoUsuario >= posicaoNecessaria;
}

module.exports = { NIVEIS_ACESSO, HIERARQUIA_ACESSO, temNivelNecessario };
