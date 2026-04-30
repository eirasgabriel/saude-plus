import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  carregarGoogleMaps,
  criarEnderecoClinica,
  criarQueryLocalizacaoClinica,
  criarUrlEmbedGoogleMapsPorQuery,
  criarUrlGoogleMapsPorQuery,
  criarUrlRotaGoogleMapsPorQuery,
  geocodificarEndereco,
  obterCoordenadasDaClinica,
  obterGoogleMapsApiKey,
} from "../../infrastructure/api/mapas-api";

function MapaGoogleClinica({ clinica }) {
  const elementoMapaRef = useRef(null);
  const mapaRef = useRef(null);
  const marcadorRef = useRef(null);
  const temChaveGoogleMaps = Boolean(obterGoogleMapsApiKey());
  const [coordenadas, setCoordenadas] = useState(() =>
    obterCoordenadasDaClinica(clinica)
  );
  const [queryLocalizacao, setQueryLocalizacao] = useState(() =>
    criarQueryLocalizacaoClinica(clinica)
  );
  const [modoFallback, setModoFallback] = useState(!temChaveGoogleMaps);
  const [carregando, setCarregando] = useState(temChaveGoogleMaps);
  const [mensagem, setMensagem] = useState("");

  const tituloMarcador = useMemo(
    () => `${clinica?.nome || "Clinica"} - ${clinica?.bairro || "Saquarema"}`,
    [clinica?.bairro, clinica?.nome]
  );
  const enderecoExibido = String(clinica?.endereco || "").trim() || criarEnderecoClinica(clinica);

  useEffect(() => {
    let cancelado = false;

    async function renderizarMapa() {
      const coordenadasConhecidas = obterCoordenadasDaClinica(clinica);
      const queryInicial = criarQueryLocalizacaoClinica(clinica);
      setCoordenadas(coordenadasConhecidas);
      setQueryLocalizacao(queryInicial);

      if (!temChaveGoogleMaps) {
        setModoFallback(true);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setMensagem("");
      setModoFallback(false);

      try {
        const maps = await carregarGoogleMaps();
        if (cancelado || !elementoMapaRef.current) return;

        let ponto = coordenadasConhecidas;

        if (!ponto) {
          const endereco = criarQueryLocalizacaoClinica(clinica);
          const coordenadasPorEndereco = await geocodificarEndereco(endereco);
          ponto = {
            latitude: coordenadasPorEndereco.latitude,
            longitude: coordenadasPorEndereco.longitude,
          };
        }

        if (cancelado || !elementoMapaRef.current) return;

        setCoordenadas(ponto);
        setQueryLocalizacao(queryInicial || `${ponto.latitude},${ponto.longitude}`);

        const center = {
          lat: ponto.latitude,
          lng: ponto.longitude,
        };

        if (!mapaRef.current) {
          mapaRef.current = new maps.Map(elementoMapaRef.current, {
            center,
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true,
          });
        } else {
          mapaRef.current.setCenter(center);
          mapaRef.current.setZoom(16);
        }

        if (marcadorRef.current) {
          marcadorRef.current.setMap(null);
        }

        marcadorRef.current = new maps.Marker({
          position: center,
          map: mapaRef.current,
          title: tituloMarcador,
        });
      } catch (erro) {
        setModoFallback(true);
        setMensagem(
          erro.message ||
            "Nao foi possivel carregar o Google Maps. O mapa abaixo usa o endereco como fallback."
        );
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    renderizarMapa();

    return () => {
      cancelado = true;
    };
  }, [clinica, tituloMarcador]);

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
        <p className="mt-1 text-sm text-gray-500">
          {enderecoExibido}
        </p>
      </div>

      <div className="relative min-h-[320px] bg-gray-100">
        {modoFallback && urlEmbed ? (
          <iframe
            title={`Mapa de ${clinica?.nome || "clinica"}`}
            src={urlEmbed}
            className="h-[320px] w-full border-0 sm:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div ref={elementoMapaRef} className="h-[320px] w-full sm:h-[420px]" />
        )}

        {!queryLocalizacao && !carregando && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6 text-center">
            <p className="text-sm text-red-600">
              Informe endereco ou latitude e longitude para exibir a localizacao desta clinica.
            </p>
          </div>
        )}

        {carregando && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 p-6 text-center">
            <p className="text-sm text-gray-500">Carregando Google Maps...</p>
          </div>
        )}
      </div>

      {mensagem && (
        <p className="border-t border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {mensagem}
        </p>
      )}

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
