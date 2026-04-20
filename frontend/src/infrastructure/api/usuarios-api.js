import { requisitarJson } from "./http-client";

async function listarUsuariosApi() {
  return requisitarJson("/api/usuarios");
}

async function criarUsuarioApi(usuario) {
  return requisitarJson("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
}

async function atualizarUsuarioApi(id, usuario) {
  return requisitarJson(`/api/usuarios/${encodeURIComponent(String(id))}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
}

export { listarUsuariosApi, criarUsuarioApi, atualizarUsuarioApi };
