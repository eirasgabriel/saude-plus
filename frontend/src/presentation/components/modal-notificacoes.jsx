import React, { useState } from "react";
import {
  ativarNotificacoesPush,
  dispensarPermissaoNotificacoes,
} from "../../infrastructure/pwa/push-notifications";

function ModalNotificacoes({ aberto, aoFechar }) {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  if (!aberto) return null;

  async function permitirNotificacoes() {
    setCarregando(true);
    setMensagem("");
    setErro("");

    try {
      const resultado = await ativarNotificacoesPush({ exibirConfirmacao: true });
      setMensagem(resultado.mensagem || "Notificações ativadas. Vamos avisar quando houver novidades.");
      window.setTimeout(aoFechar, 900);
    } catch (falha) {
      setErro(
        falha.message ||
          "Não conseguimos ativar notificações neste dispositivo."
      );
    } finally {
      setCarregando(false);
    }
  }

  function dispensar() {
    dispensarPermissaoNotificacoes();
    aoFechar();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-notificacoes-titulo"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-7">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1 shadow-sm ring-1 ring-blue-100">
          <img
            src="/icons/logo-saude-plus.png"
            alt="Saúde+"
            className="h-full w-full object-contain"
          />
        </div>

        <h2
          id="modal-notificacoes-titulo"
          className="text-xl font-bold leading-tight text-slate-900"
        >
          Ativar notificações?
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          O Saúde+ pode avisar sobre consultas, exames e resultados importantes,
          mesmo quando você não estiver com o app aberto.
        </p>

        {mensagem && (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {mensagem}
          </p>
        )}

        {erro && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            {erro}
          </p>
        )}

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={permitirNotificacoes}
            disabled={carregando || Boolean(mensagem)}
            className="min-h-12 rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-200"
          >
            {carregando ? "Ativando..." : "Permitir notificações"}
          </button>

          <button
            type="button"
            onClick={erro ? aoFechar : dispensar}
            disabled={carregando}
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {erro ? "Entendi" : "Agora não"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNotificacoes;
