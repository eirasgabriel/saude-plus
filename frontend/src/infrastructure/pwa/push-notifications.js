import { requisitarJson } from "../api/http-client";
import { registrarServiceWorker } from "./service-worker";

const CHAVE_SUBSCRIPTION = "saude_push_subscription";
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";

function suportaNotificacoesPush() {
  return (
    "Notification" in window &&
    "PushManager" in window &&
    "serviceWorker" in navigator
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function enviarSubscriptionParaBackend(subscription) {
  const payload = subscription.toJSON ? subscription.toJSON() : subscription;

  localStorage.setItem(CHAVE_SUBSCRIPTION, JSON.stringify(payload));

  try {
    return await requisitarJson("/api/notificacoes/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (erro) {
    console.warn("Subscription salva apenas localmente:", erro.message);
    return { modo: "local", subscription: payload };
  }
}

async function exibirNotificacaoLocal(registration) {
  await registration.showNotification("Notificacoes ativadas", {
    body: "O Saude+ podera avisar sobre consultas, exames e atualizacoes.",
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    data: { url: "/paciente/inicio" },
  });
}

async function ativarNotificacoesPush() {
  if (!suportaNotificacoesPush()) {
    throw new Error("Este navegador nao suporta notificacoes push.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permissao de notificacao nao concedida.");
  }

  const registration = await registrarServiceWorker();

  if (!VAPID_PUBLIC_KEY) {
    await exibirNotificacaoLocal(registration);
    return {
      status: "demo",
      mensagem:
        "Permissao concedida. Configure REACT_APP_VAPID_PUBLIC_KEY para criar subscriptions reais.",
    };
  }

  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  await enviarSubscriptionParaBackend(subscription);
  await exibirNotificacaoLocal(registration);

  return {
    status: "ativo",
    mensagem: "Notificacoes push ativadas neste dispositivo.",
  };
}

function obterStatusNotificacoes() {
  if (!("Notification" in window)) {
    return "indisponivel";
  }

  return Notification.permission;
}

export {
  ativarNotificacoesPush,
  obterStatusNotificacoes,
  suportaNotificacoesPush,
};
