import { requisitarJson } from "./http-client";

async function autenticarUsuarioApi(email, senha) {
  return requisitarJson("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
}

export { autenticarUsuarioApi };
