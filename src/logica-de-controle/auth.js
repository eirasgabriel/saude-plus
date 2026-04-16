
// LÓGICA DE AUTENTICAÇÃO — Saúde+
// Controla login, logout e verificação de permissões


// Níveis de acesso disponíveis no sistema
const NIVEIS_ACESSO = {
  ADMIN_MASTER: "admin_master",     // Prefeitura — acesso total
  ADMIN_CLINICA: "admin_clinica",   // Gestão de uma clínica específica
  MEDICO: "medico",                 // Visualiza apenas sua clínica (RN2)
  PACIENTE: "paciente",             // Agenda consultas
};

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 * @returns {object} Dados do usuário autenticado ou erro
 */
async function realizarLogin(email, senha) {
  try {
    // TODO: substituir pela chamada real à API
    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      // Retorna mensagem de erro 
      throw new Error(dados.mensagem || "Erro ao realizar login.");
    }

    localStorage.setItem("saude_usuario", JSON.stringify(dados.usuario));
    return dados;
    
  } catch (erro) {
    throw new Error(erro.message || "Falha na conexão. Tente novamente.");
  }
}

/**
 * Realiza o logout — remove dados da sessão
 */
function realizarLogout() {
  localStorage.removeItem("saude_usuario");
  // Redireciona para a tela de login
  window.location.href = "/login";
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} true se autenticado
 */
function estaAutenticado() {
  return !!localStorage.getItem("saude_usuario");
}

/**
 * Retorna os dados do usuário logado
 * @returns {object|null} Dados do usuário ou null
 */
function obterUsuarioAtual() {
  const dados = localStorage.getItem("saude_usuario");
  return dados ? JSON.parse(dados) : null;
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 * Aplica RN2: médicos só veem sua própria clínica
 * @param {string} nivelNecessario - Nível mínimo exigido
 * @returns {boolean}
 */
function temPermissao(nivelNecessario) {
  const usuario = obterUsuarioAtual();
  if (!usuario) return false;

  const hierarquia = [
    NIVEIS_ACESSO.PACIENTE,
    NIVEIS_ACESSO.MEDICO,
    NIVEIS_ACESSO.ADMIN_CLINICA,
    NIVEIS_ACESSO.ADMIN_MASTER,
  ];

  const posicaoUsuario = hierarquia.indexOf(usuario.nivel_acesso);
  const posicaoNecessaria = hierarquia.indexOf(nivelNecessario);

  return posicaoUsuario >= posicaoNecessaria;
}

export {
  NIVEIS_ACESSO,
  realizarLogin,
  realizarLogout,
  estaAutenticado,
  obterUsuarioAtual,
  temPermissao,
};
