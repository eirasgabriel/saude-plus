import {
  atualizarUsuarioApi,
  criarUsuarioApi,
  listarUsuariosApi,
} from "../../infrastructure/api/usuarios-api";

async function listarUsuarios() {
  const dados = await listarUsuariosApi();
  return Array.isArray(dados) ? dados : [];
}

async function salvarUsuario(usuario) {
  if (usuario.id) {
    return atualizarUsuarioApi(usuario.id, usuario);
  }

  return criarUsuarioApi(usuario);
}

async function alternarStatusUsuario(usuario) {
  return atualizarUsuarioApi(usuario.id, {
    ...usuario,
    status: usuario.status === "ativo" ? "bloqueado" : "ativo",
  });
}

export { listarUsuarios, salvarUsuario, alternarStatusUsuario };
