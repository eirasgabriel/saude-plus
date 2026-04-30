const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
let googleMapsPromise = null;

function obterCoordenadasDaClinica(clinica) {
  const latitude = Number(clinica?.latitude);
  const longitude = Number(clinica?.longitude);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function obterGoogleMapsApiKey() {
  return GOOGLE_MAPS_API_KEY;
}

function carregarGoogleMaps() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Google Maps so pode ser carregado no navegador."));
  }

  if (window.google?.maps) return Promise.resolve(window.google.maps);

  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Configure REACT_APP_GOOGLE_MAPS_API_KEY para usar o Google Maps."));
  }

  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = "__saudePlusGoogleMapsReady";
    const scriptExistente = document.querySelector("script[data-saude-google-maps]");

    window[callbackName] = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps carregou sem a biblioteca de mapas."));
      }
    };

    if (scriptExistente) {
      scriptExistente.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google.maps);
      });
      scriptExistente.addEventListener("error", () => {
        reject(new Error("Nao foi possivel carregar o Google Maps."));
      });
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      loading: "async",
      callback: callbackName,
      language: "pt-BR",
      region: "BR",
    });

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.dataset.saudeGoogleMaps = "true";
    script.onerror = () => reject(new Error("Nao foi possivel carregar o Google Maps."));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

function criarQueryCoordenadas(coordenadas) {
  if (!coordenadas) return "";

  const { latitude, longitude } = coordenadas;

  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return "";
  }

  return `${latitude},${longitude}`;
}

function criarEnderecoClinica(clinica) {
  const partes = [
    clinica?.endereco,
    clinica?.bairro,
    "Saquarema/RJ",
    "Brasil",
  ]
    .map((parte) => String(parte || "").trim())
    .filter(Boolean);

  return [...new Set(partes)].join(", ");
}

function criarQueryLocalizacaoClinica(clinica) {
  return criarEnderecoClinica(clinica) || criarQueryCoordenadas(obterCoordenadasDaClinica(clinica));
}

function criarUrlGoogleMapsPorQuery(query) {
  if (!query) return "#";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function criarUrlRotaGoogleMapsPorQuery(query) {
  if (!query) return "#";

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    query
  )}`;
}

function criarUrlEmbedGoogleMapsPorQuery(query) {
  if (!query) return "";

  return `https://www.google.com/maps?q=${encodeURIComponent(
    query
  )}&z=16&output=embed`;
}

function criarUrlGoogleMaps(coordenadas) {
  return criarUrlGoogleMapsPorQuery(criarQueryCoordenadas(coordenadas));
}

function criarUrlRotaGoogleMaps(coordenadas) {
  return criarUrlRotaGoogleMapsPorQuery(criarQueryCoordenadas(coordenadas));
}

function criarUrlEmbedGoogleMaps(coordenadas) {
  return criarUrlEmbedGoogleMapsPorQuery(criarQueryCoordenadas(coordenadas));
}

function traduzirStatusGeocoder(status) {
  if (status === "ZERO_RESULTS") return "Endereco nao encontrado no Google Maps.";
  if (status === "REQUEST_DENIED") return "A chave do Google Maps nao autorizou a geocodificacao.";
  if (status === "OVER_QUERY_LIMIT") return "Limite de consultas do Google Maps atingido.";
  if (status === "INVALID_REQUEST") return "Endereco insuficiente para localizar a clinica.";
  return "Nao foi possivel localizar o endereco no Google Maps.";
}

async function geocodificarEndereco(endereco) {
  const address = String(endereco || "").trim();

  if (!address) {
    throw new Error("Informe um endereco para buscar as coordenadas.");
  }

  const maps = await carregarGoogleMaps();
  const geocoder = new maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      {
        address,
        componentRestrictions: { country: "BR" },
        region: "BR",
      },
      (resultados, status) => {
        if (status !== "OK" || !resultados?.[0]?.geometry?.location) {
          reject(new Error(traduzirStatusGeocoder(status)));
          return;
        }

        const resultado = resultados[0];
        const localizacao = resultado.geometry.location;

        resolve({
          latitude: Number(localizacao.lat().toFixed(6)),
          longitude: Number(localizacao.lng().toFixed(6)),
          enderecoFormatado: resultado.formatted_address || address,
        });
      }
    );
  });
}

export {
  carregarGoogleMaps,
  criarEnderecoClinica,
  criarQueryLocalizacaoClinica,
  criarUrlEmbedGoogleMaps,
  criarUrlEmbedGoogleMapsPorQuery,
  criarUrlGoogleMaps,
  criarUrlGoogleMapsPorQuery,
  criarUrlRotaGoogleMaps,
  criarUrlRotaGoogleMapsPorQuery,
  geocodificarEndereco,
  obterCoordenadasDaClinica,
  obterGoogleMapsApiKey,
};
