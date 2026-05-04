import React, { useMemo } from "react";
import {
  criarEnderecoClinica,
  criarQueryLocalizacaoClinica,
  criarUrlEmbedGoogleMapsPorQuery,
  criarUrlGoogleMapsPorQuery,
  criarUrlRotaGoogleMapsPorQuery,
} from "../../infrastructure/api/mapas-api";

function MapaGoogleClinica({ clinica }) {
  const queryLocalizacao = useMemo(
    () => criarQueryLocalizacaoClinica(clinica),
    [clinica]
  );
  const enderecoExibido =
    String(clinica?.endereco || "").trim() || criarEnderecoClinica(clinica);
  const urlLocalizacao = queryLocalizacao
    ? criarUrlGoogleMapsPorQuery(queryLocalizacao)
    : "#";
  const urlRota = queryLocalizacao
    ? criarUrlRotaGoogleMapsPorQuery(queryLocalizacao)
    : "#";
  const urlEmbed = queryLocalizacao
    ? criarUrlEmbedGoogleMapsPorQuery(queryLocalizacao)
    : "";

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-800">Localizacao</h2>
        <p className="mt-1 text-sm text-gray-500">{enderecoExibido}</p>
      </div>

      <div className="relative min-h-[320px] bg-gray-100">
        {urlEmbed ? (
          <iframe
            title={`Mapa de ${clinica?.nome || "clinica"}`}
            src={urlEmbed}
            className="h-[320px] w-full border-0 sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="flex h-[320px] w-full items-center justify-center bg-gray-100 p-6 text-center sm:h-[420px]">
            <p className="text-sm text-red-600">
              Informe endereco ou latitude e longitude para exibir a localizacao desta clinica.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-2 p-4 sm:grid-cols-2">
        <a
          href={urlLocalizacao}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!queryLocalizacao}
          onClick={(evento) => {
            if (!queryLocalizacao) evento.preventDefault();
          }}
          className={`rounded-xl px-4 py-3 text-center text-sm font-bold transition ${
            queryLocalizacao
              ? "bg-blue-400 text-white hover:bg-blue-500"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Abrir localizacao
        </a>
        <a
          href={urlRota}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!queryLocalizacao}
          onClick={(evento) => {
            if (!queryLocalizacao) evento.preventDefault();
          }}
          className={`rounded-xl border px-4 py-3 text-center text-sm font-bold transition ${
            queryLocalizacao
              ? "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400"
          }`}
        >
          Ver rota
        </a>
      </div>
    </section>
  );
}

export default MapaGoogleClinica;
