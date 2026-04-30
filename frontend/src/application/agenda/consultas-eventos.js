const EVENTO_CONSULTAS_ATUALIZADAS = "saude-plus:consultas-atualizadas";
const CHAVE_CONSULTAS_ATUALIZADAS = "saude_plus_consultas_atualizadas_em";

function notificarConsultasAtualizadas() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(EVENTO_CONSULTAS_ATUALIZADAS));

  try {
    window.localStorage.setItem(CHAVE_CONSULTAS_ATUALIZADAS, String(Date.now()));
  } catch {
    // O evento local acima ja cobre a aba atual.
  }
}

function ouvirConsultasAtualizadas(callback) {
  if (typeof window === "undefined") return () => {};

  function aoAtualizarNaAbaAtual() {
    callback();
  }

  function aoAtualizarEmOutraAba(evento) {
    if (evento.key === CHAVE_CONSULTAS_ATUALIZADAS) {
      callback();
    }
  }

  window.addEventListener(EVENTO_CONSULTAS_ATUALIZADAS, aoAtualizarNaAbaAtual);
  window.addEventListener("storage", aoAtualizarEmOutraAba);

  return () => {
    window.removeEventListener(EVENTO_CONSULTAS_ATUALIZADAS, aoAtualizarNaAbaAtual);
    window.removeEventListener("storage", aoAtualizarEmOutraAba);
  };
}

export {
  EVENTO_CONSULTAS_ATUALIZADAS,
  notificarConsultasAtualizadas,
  ouvirConsultasAtualizadas,
};
