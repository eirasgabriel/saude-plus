const EVENTO_EXAMES_ATUALIZADOS = "saude-plus:exames-atualizados";
const CHAVE_EXAMES_ATUALIZADOS = "saude_plus_exames_atualizados_em";

function notificarExamesAtualizados() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(EVENTO_EXAMES_ATUALIZADOS));

  try {
    window.localStorage.setItem(CHAVE_EXAMES_ATUALIZADOS, String(Date.now()));
  } catch {
    // O evento local acima ja cobre a aba atual.
  }
}

function ouvirExamesAtualizados(callback) {
  if (typeof window === "undefined") return () => {};

  function aoAtualizarNaAbaAtual() {
    callback();
  }

  function aoAtualizarEmOutraAba(evento) {
    if (evento.key === CHAVE_EXAMES_ATUALIZADOS) {
      callback();
    }
  }

  window.addEventListener(EVENTO_EXAMES_ATUALIZADOS, aoAtualizarNaAbaAtual);
  window.addEventListener("storage", aoAtualizarEmOutraAba);

  return () => {
    window.removeEventListener(EVENTO_EXAMES_ATUALIZADOS, aoAtualizarNaAbaAtual);
    window.removeEventListener("storage", aoAtualizarEmOutraAba);
  };
}

export {
  EVENTO_EXAMES_ATUALIZADOS,
  notificarExamesAtualizados,
  ouvirExamesAtualizados,
};
