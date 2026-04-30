let registroServiceWorker = null;

function suportaServiceWorker() {
  return "serviceWorker" in navigator;
}

async function registrarServiceWorker() {
  if (!suportaServiceWorker()) {
    return null;
  }

  if (process.env.NODE_ENV !== "production") {
    const registros = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registros.map((registro) => registro.unregister()));

    if ("caches" in window) {
      const chaves = await caches.keys();
      await Promise.all(
        chaves
          .filter((chave) => chave.startsWith("saude-plus-"))
          .map((chave) => caches.delete(chave))
      );
    }

    return null;
  }

  if (registroServiceWorker) {
    return registroServiceWorker;
  }

  registroServiceWorker = await navigator.serviceWorker.register("/sw.js");
  return registroServiceWorker;
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
