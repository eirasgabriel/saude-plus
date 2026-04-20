import { requisitarJson } from "./http-client";

async function obterRelatoriosSistemaApi() {
  return requisitarJson("/api/relatorios/sistema");
}

export { obterRelatoriosSistemaApi };
