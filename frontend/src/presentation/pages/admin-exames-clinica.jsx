import React, { useEffect, useState } from "react";
import { obterUsuarioAtual, realizarLogout } from "../../application/auth/auth-service";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
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
  const nomeClinica = clinicaVinculada?.nome || "Clinica nao identificada";

  useEffect(() => {
    async function carregarClinicaVinculada() {
      if (!usuario?.clinica_id) return;

      setErro("");
      try {
        setClinicaVinculada(await buscarClinicaPorId(usuario.clinica_id));
      } catch (falha) {
        setErro(falha.message || "Nao foi possivel carregar a clinica vinculada.");
      }
    }

    carregarClinicaVinculada();
  }, [usuario?.clinica_id]);

  function sairDaConta() {
    setMenuUsuarioAberto(false);
    realizarLogout();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-blue-400 px-5 pb-6 pt-12 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-blue-100">Admin da Clinica</p>
            <h1 className="text-2xl font-bold leading-tight text-white">Exames</h1>
          </div>
          <div className="relative z-30">
            <button
              type="button"
              onClick={() => setMenuUsuarioAberto((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white bg-opacity-20 text-xl text-white"
              aria-label="Perfil do usuario"
            >
              +
            </button>
            {menuUsuarioAberto && (
              <div className="absolute right-0 z-40 mt-2 w-40 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                <button
                  type="button"
                  onClick={sairDaConta}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-blue-100">
          Exames da clinica {nomeClinica}
        </p>
      </header>

      <main className="space-y-4 px-4 py-5">
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
