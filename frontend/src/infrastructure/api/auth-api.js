import { requisitarJson } from "./http-client";

async function autenticarUsuarioApi(email, senha) {
  return requisitarJson("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
}

async function recuperarSenhaApi(email, novaSenha, codigoRecuperacao = "") {
  return requisitarJson("/api/auth/recuperar-senha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, novaSenha, codigoRecuperacao }),
  });
}

async function encerrarSessaoApi() {
  return requisitarJson("/api/auth/logout", {
    method: "POST",
  });
}

export { autenticarUsuarioApi, encerrarSessaoApi, recuperarSenhaApi };
