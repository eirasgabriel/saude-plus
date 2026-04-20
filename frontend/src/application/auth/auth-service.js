import { NIVEIS_ACESSO, usuarioTemNivel } from "../../domain/auth/niveis-acesso";
import { autenticarUsuarioApi } from "../../infrastructure/api/auth-api";
import {
  existeUsuarioSessao,
  obterUsuarioSessao,
  removerUsuarioSessao,
  salvarUsuarioSessao,
} from "../../infrastructure/storage/sessao-usuario";

async function realizarLogin(email, senha) {
  try {
    const dados = await autenticarUsuarioApi(email, senha);
    salvarUsuarioSessao(dados.usuario);
    return dados;
  } catch (erro) {
    throw new Error(erro.message || "Falha na conexao. Tente novamente.");
  }
}

function registrarUsuarioAutenticado(usuario) {
  salvarUsuarioSessao(usuario);
}

function realizarLogout() {
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
  registrarUsuarioAutenticado,
  realizarLogout,
  estaAutenticado,
  obterUsuarioAtual,
  temPermissao,
};
