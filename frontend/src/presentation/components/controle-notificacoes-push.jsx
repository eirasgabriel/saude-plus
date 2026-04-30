import React, { useMemo, useState } from "react";
import { Bell, BellRing, Loader2 } from "lucide-react";
import {
  ativarNotificacoesPush,
  obterStatusNotificacoes,
  suportaNotificacoesPush,
} from "../../infrastructure/pwa/push-notifications";

function ControleNotificacoesPush() {
  const [status, setStatus] = useState(obterStatusNotificacoes());
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const suporte = useMemo(() => suportaNotificacoesPush(), []);
  const jaAtivo = status === "granted";

  async function ativar() {
    setCarregando(true);
    setMensagem("");

    try {
      const resultado = await ativarNotificacoesPush();
      setStatus(obterStatusNotificacoes());
      setMensagem(resultado.mensagem);
    } catch (erro) {
      setStatus(obterStatusNotificacoes());
      setMensagem(erro.message || "Nao foi possivel ativar as notificacoes.");
    } finally {
      setCarregando(false);
    }
  }

  if (!suporte) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Notificacoes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Este navegador nao oferece suporte a notificacoes push.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {jaAtivo ? <BellRing size={20} /> : <Bell size={20} />}
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Notificacoes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Receba avisos sobre consultas, exames e atualizacoes do sistema.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={ativar}
          disabled={carregando || jaAtivo}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
        >
          {carregando ? <Loader2 className="animate-spin" size={18} /> : null}
          {jaAtivo ? "Ativadas" : "Ativar"}
        </button>
      </div>

      {mensagem && (
        <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {mensagem}
        </p>
      )}
    </section>
  );
}

export default ControleNotificacoesPush;
