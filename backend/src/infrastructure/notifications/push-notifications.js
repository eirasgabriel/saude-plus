const webPush = require("web-push");

function limparSubscription(subscription) {
  const { usuarioId: _usuarioId, atualizadoEm: _atualizadoEm, ...payload } = subscription || {};
  return payload;
}

function criarPushNotifications({ env = {}, subscriptions = [], pool = null } = {}) {
  const vapidPublicKey = env.vapidPublicKey || "";
  const vapidPrivateKey = env.vapidPrivateKey || "";
  const vapidSubject = env.vapidSubject || "mailto:admin@saude-plus.local";
  const habilitado = Boolean(vapidPublicKey && vapidPrivateKey);

  if (habilitado) {
    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  }

  async function salvarSubscription(subscription, usuario) {
    if (!subscription || !subscription.endpoint) {
      return { salvo: false, total: subscriptions.length };
    }

    const usuarioId = usuario?.id != null ? Number(usuario.id) : null;
    const registro = {
      ...subscription,
      usuarioId,
      atualizadoEm: new Date().toISOString(),
    };

    if (pool) {
      const { rows } = await pool.query(
        `insert into push_subscriptions (endpoint, usuario_id, subscription, atualizado_em)
         values ($1, $2, $3::jsonb, now())
         on conflict (endpoint) do update set
           usuario_id = excluded.usuario_id,
           subscription = excluded.subscription,
           atualizado_em = now()
         returning endpoint`,
        [subscription.endpoint, usuarioId, JSON.stringify(limparSubscription(subscription))]
      );

      return { salvo: rows.length > 0, pushRemoto: habilitado };
    }

    const existente = subscriptions.findIndex(
      (item) => item.endpoint === subscription.endpoint
    );

    if (existente >= 0) {
      subscriptions[existente] = registro;
    } else {
      subscriptions.push(registro);
    }

    return { salvo: true, total: subscriptions.length, pushRemoto: habilitado };
  }

  async function listarSubscriptionsUsuario(usuarioId) {
    if (!pool) {
      return subscriptions.filter(
        (subscription) => Number(subscription.usuarioId) === Number(usuarioId)
      );
    }

    const { rows } = await pool.query(
      "select subscription from push_subscriptions where usuario_id = $1",
      [usuarioId]
    );

    return rows.map((row) => row.subscription);
  }

  async function removerSubscription(endpoint) {
    if (!endpoint) return;

    if (pool) {
      await pool.query("delete from push_subscriptions where endpoint = $1", [endpoint]);
      return;
    }

    const indiceOriginal = subscriptions.findIndex(
      (subscription) => subscription.endpoint === endpoint
    );

    if (indiceOriginal >= 0) {
      subscriptions.splice(indiceOriginal, 1);
    }
  }

  async function enviarParaUsuario(usuarioId, payload) {
    if (!habilitado || usuarioId == null) {
      return { enviado: false, motivo: "push_desabilitado" };
    }

    const destino = await listarSubscriptionsUsuario(usuarioId);

    if (destino.length === 0) {
      return { enviado: false, motivo: "sem_subscription" };
    }

    const corpo = JSON.stringify(payload);
    const resultados = await Promise.allSettled(
      destino.map((subscription) => webPush.sendNotification(subscription, corpo))
    );

    for (let index = resultados.length - 1; index >= 0; index -= 1) {
      const resultado = resultados[index];
      const statusCode = resultado.reason?.statusCode;

      if (resultado.status === "rejected" && [404, 410].includes(statusCode)) {
        await removerSubscription(destino[index].endpoint);
      }
    }

    return {
      enviado: resultados.some((resultado) => resultado.status === "fulfilled"),
      total: destino.length,
    };
  }

  return {
    habilitado,
    salvarSubscription,
    enviarParaUsuario,
  };
}

module.exports = { criarPushNotifications };
