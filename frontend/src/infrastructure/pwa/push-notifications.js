import { requisitarJson } from "../api/http-client";
import { registrarServiceWorker } from "./service-worker";

const CHAVE_SUBSCRIPTION = "saude_push_subscription";
const CHAVE_PUSH_LOCAL_ATIVO = "saude_push_local_ativo";
const CHAVE_PERMISSAO_PUSH = "saude_push_permission";
const CHAVE_PUSH_SOLICITADO = "saude_push_permission_solicitada";
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

async function exibirNotificacaoSaudePlus({
  titulo = "Saude+",
  corpo = "Voce tem uma nova atualizacao no Saude+.",
  url = "/paciente/inicio",
  tag = "saude-plus",
} = {}) {
  if (!suportaNotificacoesPush() || Notification.permission !== "granted") {
    return false;
  }

  const opcoes = {
    body: corpo,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag,
    data: { url },
  };

  try {
    const registration = await registrarServiceWorker();
    if (registration?.showNotification) {
      await registration.showNotification(titulo, opcoes);
      return true;
    }
  } catch (erro) {
    console.warn("Service worker indisponivel para notificacao:", erro.message);
  }

  new Notification(titulo, opcoes);
  return true;
}

function armazenarPermissaoNotificacoes(permission) {
  localStorage.setItem(CHAVE_PERMISSAO_PUSH, permission);
  localStorage.setItem(CHAVE_PUSH_SOLICITADO, "true");
}

function notificacoesJaInicializadas() {
  return localStorage.getItem(CHAVE_PUSH_LOCAL_ATIVO) === "true";
}

async function ativarNotificacoesPush({ exibirConfirmacao = true } = {}) {
  if (!suportaNotificacoesPush()) {
    throw new Error("Este navegador nao suporta notificacoes push.");
  }

  const permission = await Notification.requestPermission();
  armazenarPermissaoNotificacoes(permission);

  if (permission !== "granted") {
    throw new Error("Permissao de notificacao nao concedida.");
  }

  const registration = await registrarServiceWorker();

  if (!VAPID_PUBLIC_KEY) {
    localStorage.setItem(CHAVE_PUSH_LOCAL_ATIVO, "true");
    if (exibirConfirmacao) {
      await exibirNotificacaoSaudePlus({
        titulo: "Notificacoes ativadas",
        corpo: "O Saude+ podera avisar sobre consultas, exames e atualizacoes.",
      });
    }
    return {
      status: "local",
      mensagem:
        "Permissao concedida. As notificacoes locais ja estao ativas neste navegador.",
    };
  }

  if (!registration?.pushManager) {
    throw new Error("Nao foi possivel registrar o dispositivo para push.");
  }

  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  await enviarSubscriptionParaBackend(subscription);
  localStorage.setItem(CHAVE_PUSH_LOCAL_ATIVO, "true");
  if (exibirConfirmacao) {
    await exibirNotificacaoSaudePlus({
      titulo: "Notificacoes ativadas",
      corpo: "O Saude+ podera avisar sobre consultas, exames e atualizacoes.",
    });
  }

  return {
    status: "ativo",
    mensagem: "Notificacoes push ativadas neste dispositivo.",
  };
}

async function testarNotificacaoPush() {
  const exibida = await exibirNotificacaoSaudePlus({
    titulo: "Saude+",
    corpo: "Teste enviado com sucesso. Suas notificacoes estao funcionando.",
    tag: "saude-plus-teste",
  });

  if (!exibida) {
    throw new Error("Ative as notificacoes antes de enviar um teste.");
  }

  return { mensagem: "Notificacao de teste enviada." };
}

async function solicitarPermissaoNotificacoesUmaVez() {
  if (!("Notification" in window)) {
    armazenarPermissaoNotificacoes("indisponivel");
    return "indisponivel";
  }

  const permissaoAtual = Notification.permission;
  const jaSolicitado = localStorage.getItem(CHAVE_PUSH_SOLICITADO) === "true";

  if (!suportaNotificacoesPush()) {
    armazenarPermissaoNotificacoes(permissaoAtual || "indisponivel");
    return permissaoAtual || "indisponivel";
  }

  if (jaSolicitado || permissaoAtual !== "default") {
    armazenarPermissaoNotificacoes(permissaoAtual);

    if (permissaoAtual === "granted" && !notificacoesJaInicializadas()) {
      ativarNotificacoesPush({ exibirConfirmacao: false }).catch((erro) => {
        console.warn("Nao foi possivel inicializar notificacoes push:", erro.message);
      });
    }

    return permissaoAtual;
  }

  try {
    const resultado = await ativarNotificacoesPush({ exibirConfirmacao: false });
    return resultado.status;
  } catch (erro) {
    const permissaoFinal = obterStatusNotificacoes();
    armazenarPermissaoNotificacoes(permissaoFinal);
    console.warn("Permissao de notificacao nao ativada:", erro.message);
    return permissaoFinal;
  }
}

function obterStatusNotificacoes() {
  if (!("Notification" in window)) {
    return "indisponivel";
  }

  return Notification.permission;
}

export {
  ativarNotificacoesPush,
  exibirNotificacaoSaudePlus,
  obterStatusNotificacoes,
  solicitarPermissaoNotificacoesUmaVez,
  suportaNotificacoesPush,
  testarNotificacaoPush,
};
