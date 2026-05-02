let registroServiceWorker = null;

function suportaServiceWorker() {
  return "serviceWorker" in navigator;
}

async function registrarServiceWorker() {
  if (!suportaServiceWorker()) {
    return null;
  }

  if (registroServiceWorker) {
    return registroServiceWorker;
  }

  registroServiceWorker = await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

function registrarServiceWorkerAoCarregar() {
  if (!suportaServiceWorker()) return;

  window.addEventListener("load", () => {
    registrarServiceWorker().catch((erro) => {
      console.error("Erro ao registrar service worker:", erro);
    });
  });
}

export { registrarServiceWorker, registrarServiceWorkerAoCarregar };
