import React, { useEffect, useRef, useState } from "react";
import { LogOut, UserCircle } from "lucide-react";
import { obterUsuarioAtual, realizarLogout } from "../../application/auth/auth-service";
import { ouvirClinicasAtualizadas } from "../../application/clinicas/clinicas-eventos";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import CabecalhoApp from "../components/cabecalho-app";
import MenuInferiorAdmin from "../components/menu-inferior-admin";

const EXAMES_DO_DIA = [
  {
    id: 1,
    paciente: "Eiras Biel",
    exame: "Hemograma completo",
    horario: "08:00",
    status: "agendado",
  },
  {
    id: 2,
    paciente: "Ana Paula Souza",
    exame: "Glicemia em jejum",
    horario: "09:30",
    status: "aguardando coleta",
  },
];

function AdminExamesClinica() {
  const usuario = obterUsuarioAtual();
  const [clinicaVinculada, setClinicaVinculada] = useState(null);
  const [erro, setErro] = useState("");
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const tempoFechamentoMenuRef = useRef(null);
  const nomeClinica = clinicaVinculada?.nome || "Clinica nao identificada";

  async function carregarClinicaVinculada() {
    if (!usuario?.clinica_id) return;

    setErro("");
    try {
      setClinicaVinculada(await buscarClinicaPorId(usuario.clinica_id));
    } catch (falha) {
      setErro(falha.message || "Nao foi possivel carregar a clinica vinculada.");
    }
  }

  useEffect(() => {
    carregarClinicaVinculada();
  }, [usuario?.clinica_id]);

  useEffect(() => ouvirClinicasAtualizadas(carregarClinicaVinculada), [usuario?.clinica_id]);

  useEffect(() => {
    return () => {
      if (tempoFechamentoMenuRef.current) {
        clearTimeout(tempoFechamentoMenuRef.current);
      }
    };
  }, []);

  function sairDaConta() {
    cancelarFechamentoDoMenu();
    setMenuUsuarioAberto(false);
    realizarLogout();
  }

  function cancelarFechamentoDoMenu() {
    if (tempoFechamentoMenuRef.current) {
      clearTimeout(tempoFechamentoMenuRef.current);
      tempoFechamentoMenuRef.current = null;
    }
  }

  function fecharMenuAoSairDoHover() {
    cancelarFechamentoDoMenu();
    tempoFechamentoMenuRef.current = setTimeout(() => {
      setMenuUsuarioAberto(false);
    }, 350);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CabecalhoApp
        contexto="Admin da Clinica"
        titulo="Exames"
        descricao={`Exames da clinica ${nomeClinica}`}
        acao={
          <div
            className="relative z-30"
            onMouseEnter={cancelarFechamentoDoMenu}
            onMouseLeave={fecharMenuAoSairDoHover}
          >
            <button
              type="button"
              onClick={() => setMenuUsuarioAberto((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label="Perfil do usuario"
            >
              <UserCircle className="h-6 w-6" aria-hidden="true" />
            </button>
            {menuUsuarioAberto && (
              <div className="absolute right-0 z-40 mt-3 w-56 overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-xl shadow-blue-950/10 ring-1 ring-black/5">
                <div className="border-b border-gray-100 bg-blue-50/70 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                    Conta
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    Opcoes do usuario
                  </p>
                </div>
                <button
                  type="button"
                  onClick={sairDaConta}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      <main className="app-content space-y-4">
        {erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{erro}</p>
          </div>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Exames hoje</p>
            <strong className="text-3xl text-gray-800">{EXAMES_DO_DIA.length}</strong>
            <p className="mt-1 text-xs text-gray-400">Agenda da unidade</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Coletas pendentes</p>
            <strong className="text-3xl text-gray-800">1</strong>
            <p className="mt-1 text-xs text-gray-400">Aguardando atendimento</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Resultados</p>
            <strong className="text-3xl text-gray-800">0</strong>
            <p className="mt-1 text-xs text-gray-400">Liberados hoje</p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Exames do dia</h2>
          <p className="mt-1 text-sm text-gray-500">
            Lista inicial para acompanhamento da rotina da unidade.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] overflow-hidden rounded-xl border border-gray-100 text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Horario</th>
                  <th className="px-3 py-2 text-left font-semibold">Paciente</th>
                  <th className="px-3 py-2 text-left font-semibold">Exame</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {EXAMES_DO_DIA.map((exame) => (
                  <tr key={exame.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-700">
                      {exame.horario}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{exame.paciente}</td>
                    <td className="px-3 py-2 text-gray-600">{exame.exame}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {exame.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <MenuInferiorAdmin abaAtiva="exames" />
      <div className="h-24" />
    </div>
  );
}

export default AdminExamesClinica;
