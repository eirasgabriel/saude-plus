import React, { useEffect, useMemo, useState } from "react";
import { obterUsuarioAtual, realizarLogout } from "../../application/auth/auth-service";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import {
  RELATORIO_VAZIO,
  obterRelatoriosSistema,
} from "../../application/sistema/relatorios-use-cases";
import MenuInferiorAdmin from "../components/menu-inferior-admin";

function HomeAdmin() {
  const usuario = obterUsuarioAtual();
  const [clinicaVinculada, setClinicaVinculada] = useState(null);
  const [relatorio, setRelatorio] = useState(RELATORIO_VAZIO);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
  const [erro, setErro] = useState("");
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const nomeClinica = clinicaVinculada?.nome || "Clinica nao identificada";

  useEffect(() => {
    async function carregarDados() {
      if (!usuario?.clinica_id) return;

      setCarregandoRelatorio(true);
      setErro("");
      try {
        const [clinica, relatorioSistema] = await Promise.all([
          buscarClinicaPorId(usuario.clinica_id),
          obterRelatoriosSistema(),
        ]);
        setClinicaVinculada(clinica);
        setRelatorio(relatorioSistema);
      } catch (falha) {
        setErro(falha.message || "Nao foi possivel carregar o painel da clinica.");
      } finally {
        setCarregandoRelatorio(false);
      }
    }

    carregarDados();
  }, [usuario?.clinica_id]);

  const relatorioClinica = useMemo(() => {
    const itemRelatorio = relatorio.porClinica.find(
      (item) => Number(item.id) === Number(clinicaVinculada?.id)
    );

    return {
      consultas: itemRelatorio?.consultas ?? 0,
      realizadas: itemRelatorio?.realizadas ?? 0,
      canceladas: itemRelatorio?.canceladas ?? 0,
      ocupacao: itemRelatorio?.ocupacao ?? 0,
      atendimentosMes:
        itemRelatorio?.atendimentosMes ?? Number(clinicaVinculada?.atendimentosMes || 0),
      satisfacao: itemRelatorio?.satisfacao ?? Number(clinicaVinculada?.satisfacao || 0),
      capacidadeDiaria: Number(clinicaVinculada?.capacidadeDiaria || 0),
      status: clinicaVinculada?.status || "nao informado",
    };
  }, [clinicaVinculada, relatorio.porClinica]);

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
            <h1 className="text-2xl font-bold leading-tight text-white">
              Painel da Clinica
            </h1>
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
          Seja bem-vindo ao sistema de gerenciamento da clinica {nomeClinica}
        </p>
      </header>

      <main className="space-y-4 px-4 py-5">
        <section className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Relatorio geral da clinica
              </h2>
              <p className="text-sm text-gray-500">
                Indicadores da unidade vinculada: {nomeClinica}
              </p>
            </div>
            {carregandoRelatorio && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Atualizando
              </span>
            )}
          </div>

          {erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Consultas no mes</p>
              <strong className="text-3xl text-gray-800">
                {relatorioClinica.consultas}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {relatorioClinica.realizadas} realizadas
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Pendencias</p>
              <strong className="text-3xl text-gray-800">
                {Math.max(
                  relatorioClinica.consultas -
                    relatorioClinica.realizadas -
                    relatorioClinica.canceladas,
                  0
                )}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {relatorioClinica.canceladas} canceladas
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Ocupacao</p>
              <strong className="text-3xl text-gray-800">
                {relatorioClinica.ocupacao}%
              </strong>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${relatorioClinica.ocupacao}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Atendimentos</p>
              <strong className="text-3xl text-gray-800">
                {relatorioClinica.atendimentosMes}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                Satisfacao {relatorioClinica.satisfacao}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Capacidade diaria</p>
              <strong className="text-2xl text-gray-800">
                {relatorioClinica.capacidadeDiaria}
              </strong>
              <p className="mt-1 text-xs text-gray-400">atendimentos por dia</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Status da unidade</p>
              <strong className="text-2xl capitalize text-gray-800">
                {relatorioClinica.status.replaceAll("_", " ")}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {clinicaVinculada?.aberta ? "Recebendo agendamentos" : "Sem novos agendamentos"}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Especialidades</p>
              <strong className="text-2xl text-gray-800">
                {(clinicaVinculada?.especialidades || []).length}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {(clinicaVinculada?.especialidades || []).slice(0, 3).join(", ") || "Sem dados"}
              </p>
            </div>
          </div>
        </section>
      </main>

      <MenuInferiorAdmin abaAtiva="inicio" />
      <div className="h-24" />
    </div>
  );
}

export default HomeAdmin;
