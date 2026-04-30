import {
  atualizarUsuarioApi,
  criarUsuarioApi,
  listarUsuariosApi,
} from "../../infrastructure/api/usuarios-api";
import { notificarUsuariosAtualizados } from "./usuarios-eventos";

async function listarUsuarios() {
  const dados = await listarUsuariosApi();
  return Array.isArray(dados) ? dados : [];
}

async function salvarUsuario(usuario) {
  if (usuario.id) {
    const atualizado = await atualizarUsuarioApi(usuario.id, usuario);
    notificarUsuariosAtualizados();
    return atualizado;
  }

  const criado = await criarUsuarioApi(usuario);
  notificarUsuariosAtualizados();
  return criado;
}

async function alternarStatusUsuario(usuario) {
  const atualizado = await atualizarUsuarioApi(usuario.id, {
    ...usuario,
    status: usuario.status === "ativo" ? "bloqueado" : "ativo",
  });
  notificarUsuariosAtualizados();
  return atualizado;
}

export { listarUsuarios, salvarUsuario, alternarStatusUsuario };
