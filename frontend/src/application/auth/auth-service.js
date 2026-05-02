import { NIVEIS_ACESSO, usuarioTemNivel } from "../../domain/auth/niveis-acesso";
import { autenticarUsuarioApi, encerrarSessaoApi, recuperarSenhaApi } from "../../infrastructure/api/auth-api";
import {
  existeUsuarioSessao,
  obterUsuarioSessao,
  removerUsuarioSessao,
  salvarUsuarioSessao,
} from "../../infrastructure/storage/sessao-usuario";

async function realizarLogin(email, senha) {
  try {
    const dados = await autenticarUsuarioApi(email, senha);
    salvarUsuarioSessao(dados.usuario, dados.token);
    return dados;
  } catch (erro) {
    throw new Error(erro.message || "Falha na conexao. Tente novamente.");
  }
}

async function recuperarSenha(email, novaSenha, codigoRecuperacao = "") {
  try {
    return await recuperarSenhaApi(email, novaSenha, codigoRecuperacao);
  } catch (erro) {
    throw new Error(erro.message || "Nao foi possivel recuperar a senha.");
  }
}

function registrarUsuarioAutenticado(usuario, token = "") {
  salvarUsuarioSessao(usuario, token);
}

function realizarLogout() {
  encerrarSessaoApi().catch(() => {});
  removerUsuarioSessao();
  window.location.href = "/login";
}

function estaAutenticado() {
  return existeUsuarioSessao();
}

function obterUsuarioAtual() {
  return obterUsuarioSessao();
}

function temPermissao(nivelNecessario) {
  return usuarioTemNivel(obterUsuarioAtual(), nivelNecessario);
}

export {
  NIVEIS_ACESSO,
  realizarLogin,
  recuperarSenha,
  registrarUsuarioAutenticado,
  realizarLogout,
  estaAutenticado,
  obterUsuarioAtual,
  temPermissao,
};
