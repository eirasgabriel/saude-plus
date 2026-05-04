import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  Percent,
  UserCircle,
} from "lucide-react";
import { obterUsuarioAtual, realizarLogout } from "../../application/auth/auth-service";
import { ouvirConsultasAtualizadas } from "../../application/agenda/consultas-eventos";
import { ouvirClinicasAtualizadas } from "../../application/clinicas/clinicas-eventos";
import { ouvirExamesAtualizados } from "../../application/exames/exames-eventos";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import { ouvirUsuariosAtualizados } from "../../application/usuarios/usuarios-eventos";
import {
  RELATORIO_VAZIO,
  obterRelatorioClinica,
} from "../../application/sistema/relatorios-use-cases";
import CabecalhoApp from "../components/cabecalho-app";
import MenuInferiorAdmin from "../components/menu-inferior-admin";

function HomeAdmin() {
  const usuario = obterUsuarioAtual();
  const [clinicaVinculada, setClinicaVinculada] = useState(null);
  const [relatorio, setRelatorio] = useState(RELATORIO_VAZIO);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
  const [erro, setErro] = useState("");
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const tempoFechamentoMenuRef = useRef(null);
  const nomeClinica = clinicaVinculada?.nome || "Clínica não identificada";

  async function carregarDados() {
    setCarregandoRelatorio(true);
    setErro("");
    try {
      const relatorioSistema = await obterRelatorioClinica(usuario?.clinica_id);
      const clinica = relatorioSistema.clinica ||
        (usuario?.clinica_id ? await buscarClinicaPorId(usuario.clinica_id) : null);
      setClinicaVinculada(clinica);
      setRelatorio(relatorioSistema);
    } catch (falha) {
      setErro(falha.message || "Não conseguimos carregar o painel da clínica agora.");
    } finally {
      setCarregandoRelatorio(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [usuario?.clinica_id]);

  useEffect(() => ouvirClinicasAtualizadas(carregarDados), [usuario?.clinica_id]);
  useEffect(() => ouvirConsultasAtualizadas(carregarDados), [usuario?.clinica_id]);
  useEffect(() => ouvirExamesAtualizados(carregarDados), [usuario?.clinica_id]);
  useEffect(() => ouvirUsuariosAtualizados(carregarDados), [usuario?.clinica_id]);

  useEffect(() => {
    return () => {
      if (tempoFechamentoMenuRef.current) {
        clearTimeout(tempoFechamentoMenuRef.current);
      }
    };
  }, []);

  const relatorioClinica = useMemo(() => {
    const indicadores = relatorio.indicadores || {};

    return {
      consultas: indicadores.consultas ?? 0,
      exames: indicadores.exames ?? 0,
      agendamentos: indicadores.agendamentos ?? indicadores.consultas ?? 0,
      realizadas: indicadores.realizadas ?? 0,
      canceladas: indicadores.canceladas ?? 0,
      examesPendentes: indicadores.examesPendentes ?? 0,
      examesRealizados: indicadores.examesRealizados ?? 0,
      ocupacao: indicadores.ocupacao ?? 0,
      atendimentosMes: indicadores.atendimentosMes ?? 0,
      capacidadeDiaria: indicadores.capacidadeDiaria ?? Number(clinicaVinculada?.capacidadeDiaria || 0),
      status: indicadores.status || clinicaVinculada?.status || "nao informado",
    };
  }, [clinicaVinculada, relatorio.indicadores]);

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
        titulo="Painel da clínica"
        descricao={`Acompanhe a rotina da clínica ${nomeClinica}`}
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
              aria-label="Perfil do usuário"
            >
              <UserCircle className="h-6 w-6" aria-hidden="true" />
            </button>
            {menuUsuarioAberto && (
              <div className="absolute right-0 z-40 mt-4 w-56 overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-xl shadow-blue-950/10 ring-1 ring-black/5 sm:right-1/2 sm:translate-x-1/2">
                <div className="border-b border-gray-100 bg-blue-50/70 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                    Conta
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    Opções do usuário
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

      <main className="app-content dashboard-shell">
        <section className="space-y-4">
          <div className="dashboard-section-header mb-0">
            <div>
              <h2 className="dashboard-section-title sm:text-xl">
                Relatório geral da clínica
              </h2>
              <p className="dashboard-section-description">
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
            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Atendimentos no mês</p>
                <CalendarDays className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <strong className="text-3xl text-gray-800">
                {relatorioClinica.agendamentos}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {relatorioClinica.consultas} consultas e {relatorioClinica.exames} exames
              </p>
            </div>

            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Pendencias</p>
                <Clock3 className="h-5 w-5 text-amber-500" aria-hidden="true" />
              </div>
              <strong className="text-3xl text-gray-800">
                {Math.max(
                  relatorioClinica.consultas -
                    relatorioClinica.realizadas -
                    relatorioClinica.canceladas,
                  0
                ) + relatorioClinica.examesPendentes}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {relatorioClinica.canceladas} consultas canceladas
              </p>
            </div>

            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Ocupação</p>
                <Percent className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              </div>
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

            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Atendimentos</p>
                <Activity className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <strong className="text-3xl text-gray-800">
                {relatorioClinica.atendimentosMes}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                Registros reais do periodo atual
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Atendimentos médicos/dia</p>
                <Building2 className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <strong className="text-2xl text-gray-800">
                {relatorioClinica.capacidadeDiaria}
              </strong>
              <p className="mt-1 text-xs text-gray-400">quantidade configurada por dia</p>
            </div>
            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Status da unidade</p>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              </div>
              <strong className="text-2xl capitalize text-gray-800">
                {relatorioClinica.status.replaceAll("_", " ")}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {clinicaVinculada?.aberta ? "Recebendo agendamentos" : "Sem novos agendamentos"}
              </p>
            </div>
            <div className="dashboard-metric">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">Especialidades</p>
                <Activity className="h-5 w-5 text-blue-400" aria-hidden="true" />
              </div>
              <strong className="text-2xl text-gray-800">
                {(clinicaVinculada?.especialidades || []).length}
              </strong>
              <p className="mt-1 text-xs text-gray-400">
                {(clinicaVinculada?.especialidades || []).slice(0, 3).join(", ") || "Ainda sem dados"}
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
