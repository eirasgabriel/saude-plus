import { requisitarJson } from "./http-client";

async function obterRelatoriosSistemaApi() {
  return requisitarJson(`/api/relatorios/sistema?ts=${Date.now()}`, {
    cache: "no-store",
  });
}

export { obterRelatoriosSistemaApi };
