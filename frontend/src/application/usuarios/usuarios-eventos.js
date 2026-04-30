const EVENTO_USUARIOS_ATUALIZADOS = "saude-plus:usuarios-atualizados";
const CHAVE_USUARIOS_ATUALIZADOS = "saude_plus_usuarios_atualizados_em";

function notificarUsuariosAtualizados() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(EVENTO_USUARIOS_ATUALIZADOS));

  try {
    window.localStorage.setItem(CHAVE_USUARIOS_ATUALIZADOS, String(Date.now()));
  } catch {
    // O evento local acima ja cobre a aba atual.
  }
}

function ouvirUsuariosAtualizados(callback) {
  if (typeof window === "undefined") return () => {};

  function aoAtualizarNaAbaAtual() {
    callback();
  }

  function aoAtualizarEmOutraAba(evento) {
    if (evento.key === CHAVE_USUARIOS_ATUALIZADOS) {
      callback();
    }
  }

  window.addEventListener(EVENTO_USUARIOS_ATUALIZADOS, aoAtualizarNaAbaAtual);
  window.addEventListener("storage", aoAtualizarEmOutraAba);

  return () => {
    window.removeEventListener(EVENTO_USUARIOS_ATUALIZADOS, aoAtualizarNaAbaAtual);
    window.removeEventListener("storage", aoAtualizarEmOutraAba);
  };
}

export {
  EVENTO_USUARIOS_ATUALIZADOS,
  notificarUsuariosAtualizados,
  ouvirUsuariosAtualizados,
};
