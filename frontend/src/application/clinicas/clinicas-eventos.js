const EVENTO_CLINICAS_ATUALIZADAS = "saude-plus:clinicas-atualizadas";
const CHAVE_CLINICAS_ATUALIZADAS = "saude_plus_clinicas_atualizadas_em";

function notificarClinicasAtualizadas() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(EVENTO_CLINICAS_ATUALIZADAS));

  try {
    window.localStorage.setItem(CHAVE_CLINICAS_ATUALIZADAS, String(Date.now()));
  } catch {
    // O evento local acima ja cobre a aba atual.
  }
}

function ouvirClinicasAtualizadas(callback) {
  if (typeof window === "undefined") return () => {};

  function aoAtualizarNaAbaAtual() {
    callback();
  }

  function aoAtualizarEmOutraAba(evento) {
    if (evento.key === CHAVE_CLINICAS_ATUALIZADAS) {
      callback();
    }
  }

  window.addEventListener(EVENTO_CLINICAS_ATUALIZADAS, aoAtualizarNaAbaAtual);
  window.addEventListener("storage", aoAtualizarEmOutraAba);

  return () => {
    window.removeEventListener(EVENTO_CLINICAS_ATUALIZADAS, aoAtualizarNaAbaAtual);
    window.removeEventListener("storage", aoAtualizarEmOutraAba);
  };
}

export {
  EVENTO_CLINICAS_ATUALIZADAS,
  notificarClinicasAtualizadas,
  ouvirClinicasAtualizadas,
};
