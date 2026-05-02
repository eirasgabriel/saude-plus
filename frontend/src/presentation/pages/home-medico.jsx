import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  LogOut,
  Stethoscope,
  UserCircle,
} from "lucide-react";
import { obterUsuarioAtual, realizarLogout } from "../../application/auth/auth-service";
import { ouvirConsultasAtualizadas } from "../../application/agenda/consultas-eventos";
import { buscarConsultasClinica } from "../../application/agenda/agendamento-use-cases";
import { ouvirClinicasAtualizadas } from "../../application/clinicas/clinicas-eventos";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import { ouvirExamesAtualizados } from "../../application/exames/exames-eventos";
import { listarExamesClinica } from "../../application/exames/exames-use-cases";
import { exibirNotificacaoSaudePlus } from "../../infrastructure/pwa/push-notifications";
import CabecalhoApp from "../components/cabecalho-app";
import MenuInferiorMedico from "../components/menu-inferior-medico";

const ROTULOS_STATUS = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

function obterDataHojeIso() {
  const hoje = new Date();
  const y = hoje.getFullYear();
  const m = String(hoje.getMonth() + 1).padStart(2, "0");
  const d = String(hoje.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function paraInicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatarData(dataIso) {
  if (!dataIso) return "-";
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function parseAgendaId(agendaId) {
  const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
    String(agendaId || "")
  );
  if (!parsed) return null;

  return {
    data: parsed[2],
    horario: `${parsed[3]}:${parsed[4]}`,
  };
}

function obterDadosAgenda(consulta) {
  const agenda = parseAgendaId(consulta.agenda_id);

  return {
    data: consulta.data || consulta.data_consulta || agenda?.data || "",
    horario: consulta.horario || consulta.hora || agenda?.horario || "-",
  };
}

function normalizarTexto(texto) {
  return String(texto || "").trim().toLowerCase();
}

function consultaPertenceAoMedico(consulta, usuario) {
  const idsMedicoUsuario = [usuario?.medico_id, usuario?.medicoId, usuario?.id]
    .filter((valor) => valor != null)
    .map(Number);

  if (idsMedicoUsuario.includes(Number(consulta.medico_id))) {
    return true;
  }

  const nomeMedicoConsulta = normalizarTexto(consulta.medico);
  const nomeUsuario = normalizarTexto(usuario?.nome);

  return Boolean(nomeUsuario && nomeMedicoConsulta.includes(nomeUsuario));
}

function examePertenceAoMedico(exame, usuario) {
  const idsMedicoUsuario = [usuario?.medico_id, usuario?.medicoId, usuario?.id]
    .filter((valor) => valor != null)
    .map(Number);

  if (idsMedicoUsuario.includes(Number(exame.medico_id))) {
    return true;
  }

  const nomeMedicoExame = normalizarTexto(exame.medico);
  const nomeUsuario = normalizarTexto(usuario?.nome);

  return Boolean(nomeUsuario && nomeMedicoExame.includes(nomeUsuario));
}

function HomeMedico() {
  const usuario = obterUsuarioAtual();
  const [clinicaVinculada, setClinicaVinculada] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [exames, setExames] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const tempoFechamentoMenuRef = useRef(null);
  const consultasConhecidasRef = useRef(new Set());
  const statusConsultasConhecidosRef = useRef(new Map());
  const primeiraCargaConsultasRef = useRef(true);
  const nomeUsuario = usuario?.nome || "Medico";
  const nomeClinica = clinicaVinculada?.nome || "clinica vinculada";

  const carregarDashboard = useCallback(async () => {
    if (!usuario?.clinica_id) {
      setErro("Nao ha clinica vinculada ao seu usuario.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const [clinica, consultasClinica, examesClinica] = await Promise.all([
        buscarClinicaPorId(usuario.clinica_id),
        buscarConsultasClinica(usuario.clinica_id, usuario.id),
        listarExamesClinica(usuario.clinica_id, usuario.id),
      ]);

      setClinicaVinculada(clinica);
      setConsultas(Array.isArray(consultasClinica) ? consultasClinica : []);
      setExames(Array.isArray(examesClinica) ? examesClinica : []);
    } catch (falha) {
      setErro(falha.message || "Nao foi possivel carregar sua agenda.");
    } finally {
      setCarregando(false);
    }
  }, [usuario?.clinica_id, usuario?.id]);

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  useEffect(() => ouvirClinicasAtualizadas(carregarDashboard), [carregarDashboard]);
  useEffect(() => ouvirConsultasAtualizadas(carregarDashboard), [carregarDashboard]);
  useEffect(() => ouvirExamesAtualizados(carregarDashboard), [carregarDashboard]);

  useEffect(() => {
    return () => {
      if (tempoFechamentoMenuRef.current) {
        clearTimeout(tempoFechamentoMenuRef.current);
      }
    };
  }, []);

  const consultasMedico = useMemo(() => {
    return consultas
      .filter((consulta) => consultaPertenceAoMedico(consulta, usuario))
      .map((consulta) => {
        const agenda = obterDadosAgenda(consulta);

        return {
          ...consulta,
          data: agenda.data,
          horario: agenda.horario,
          paciente: consulta.paciente || "",
          especialidade: consulta.especialidade || "Nao informada",
          status: consulta.status || "agendada",
        };
      })
      .filter((consulta) => consulta.paciente)
      .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
  }, [consultas, usuario]);

  const hojeIso = obterDataHojeIso();
  const inicioHoje = paraInicioDoDia(new Date());
  const fimSemana = new Date(inicioHoje);
  fimSemana.setDate(fimSemana.getDate() + 7);

  const examesMedico = useMemo(() => {
    return exames
      .filter((exame) => examePertenceAoMedico(exame, usuario))
      .map((exame) => ({
        ...exame,
        data: exame.data || "",
        horario: exame.horario || "-",
        paciente: exame.paciente || "",
        tipo: exame.tipo || "Exame",
        status: exame.status || "agendado",
      }))
      .filter((exame) => exame.paciente)
      .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
  }, [exames, usuario]);

  const agendaMedico = useMemo(() => {
    const consultasAgenda = consultasMedico.map((consulta) => ({
      id: `consulta-${consulta.id}`,
      categoria: "consulta",
      data: consulta.data,
      horario: consulta.horario,
      paciente: consulta.paciente,
      descricao: consulta.especialidade,
      status: consulta.status,
    }));

    const examesAgenda = examesMedico.map((exame) => ({
      id: `exame-${exame.id}`,
      categoria: "exame",
      data: exame.data,
      horario: exame.horario,
      paciente: exame.paciente,
      descricao: exame.tipo,
      status: exame.status,
    }));

    return [...consultasAgenda, ...examesAgenda].sort((a, b) =>
      `${a.data || ""} ${a.horario || ""}`.localeCompare(`${b.data || ""} ${b.horario || ""}`)
    );
  }, [consultasMedico, examesMedico]);

  const agendaHoje = useMemo(
    () => agendaMedico.filter((item) => item.data === hojeIso),
    [agendaMedico, hojeIso]
  );

  const resumo = useMemo(() => {
    return agendaMedico.reduce(
      (acc, item) => {
        const status = String(item.status || "").toLowerCase();
        const dataAgenda = item.data
          ? paraInicioDoDia(new Date(`${item.data}T00:00:00`))
          : null;

        if (item.data === hojeIso) {
          acc.hoje += 1;
          if (item.categoria === "consulta") acc.consultasHoje += 1;
          if (item.categoria === "exame") acc.examesHoje += 1;
          if (["agendada", "agendado", "confirmada", "aguardando coleta"].includes(status)) {
            acc.pendentesHoje += 1;
          }
        }

        if (
          dataAgenda &&
          dataAgenda >= inicioHoje &&
          dataAgenda <= fimSemana &&
          !["cancelada", "cancelado"].includes(status)
        ) {
          acc.proximosSeteDias += 1;
        }

        return acc;
      },
      { hoje: 0, consultasHoje: 0, examesHoje: 0, pendentesHoje: 0, proximosSeteDias: 0 }
    );
  }, [agendaMedico, fimSemana, hojeIso, inicioHoje]);

  useEffect(() => {
    const idsAtuais = new Set(consultasMedico.map((consulta) => String(consulta.id)));
    const statusAtuais = new Map(
      consultasMedico.map((consulta) => [
        String(consulta.id),
        String(consulta.status || "").toLowerCase(),
      ])
    );

    if (primeiraCargaConsultasRef.current) {
      consultasConhecidasRef.current = idsAtuais;
      statusConsultasConhecidosRef.current = statusAtuais;
      primeiraCargaConsultasRef.current = false;
      return;
    }

    const novasConsultas = consultasMedico.filter(
      (consulta) => !consultasConhecidasRef.current.has(String(consulta.id))
    );

    if (novasConsultas.length > 0) {
      const proximaConsulta = novasConsultas[0];
      exibirNotificacaoSaudePlus({
        titulo: "Nova consulta na sua agenda",
        corpo: `${proximaConsulta.paciente} - ${formatarData(proximaConsulta.data)} as ${proximaConsulta.horario}.`,
        url: "/medico/agenda",
        tag: `saude-plus-medico-consulta-${proximaConsulta.id}`,
      });
    }

    const consultaCancelada = consultasMedico.find((consulta) => {
      const id = String(consulta.id);
      const statusAnterior = statusConsultasConhecidosRef.current.get(id);
      const statusAtual = String(consulta.status || "").toLowerCase();
      return statusAnterior && statusAnterior !== "cancelada" && statusAtual === "cancelada";
    });

    if (consultaCancelada) {
      exibirNotificacaoSaudePlus({
        titulo: "Consulta cancelada",
        corpo: `${consultaCancelada.paciente} cancelou o atendimento de ${formatarData(consultaCancelada.data)} as ${consultaCancelada.horario}.`,
        url: "/medico/agenda",
        tag: `saude-plus-medico-cancelada-${consultaCancelada.id}`,
      });
    }

    consultasConhecidasRef.current = idsAtuais;
    statusConsultasConhecidosRef.current = statusAtuais;
  }, [consultasMedico]);

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

  function sairDaConta() {
    cancelarFechamentoDoMenu();
    setMenuUsuarioAberto(false);
    realizarLogout();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CabecalhoApp
        compacto
        titulo={`Ola, Dr(a). ${nomeUsuario}`}
        descricao={`Acompanhe os atendimentos do(a) ${nomeClinica}`}
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
              <div className="absolute right-0 z-40 mt-4 w-56 overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-xl shadow-blue-950/10 ring-1 ring-black/5 sm:right-1/2 sm:translate-x-1/2">
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

      <main className="app-content dashboard-shell">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="dashboard-metric">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Agenda hoje</p>
              <CalendarDays className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <strong className="text-3xl text-gray-800">{resumo.hoje}</strong>
            <p className="mt-1 text-xs text-gray-400">Consultas e exames em {formatarData(hojeIso)}</p>
          </div>

          <div className="dashboard-metric">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Consultas</p>
              <Clock3 className="h-5 w-5 text-amber-500" aria-hidden="true" />
            </div>
            <strong className="text-3xl text-gray-800">{resumo.consultasHoje}</strong>
            <p className="mt-1 text-xs text-gray-400">Atendimentos de hoje</p>
          </div>

          <div className="dashboard-metric">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Exames</p>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
            </div>
            <strong className="text-3xl text-gray-800">{resumo.examesHoje}</strong>
            <p className="mt-1 text-xs text-gray-400">Procedimentos de hoje</p>
          </div>

          <div className="dashboard-metric">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Proximos 7 dias</p>
              <Activity className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <strong className="text-3xl text-gray-800">{resumo.proximosSeteDias}</strong>
            <p className="mt-1 text-xs text-gray-400">Sem itens cancelados</p>
          </div>
        </section>

        {carregando && (
          <p className="text-center text-sm text-gray-500">Carregando sua agenda...</p>
        )}

        {!carregando && erro && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{erro}</p>
          </div>
        )}

        {!carregando && !erro && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                    <ClipboardList className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="dashboard-section-title">Agenda de hoje</h2>
                    <p className="dashboard-section-description">
                      Consultas e exames organizados por horario
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {agendaHoje.length} itens
                </span>
              </div>

              {agendaHoje.length === 0 ? (
                <div className="dashboard-card-muted text-center">
                  <p className="font-semibold text-gray-700">
                    Nenhum item na agenda de hoje
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Quando houver consultas ou exames para sua agenda, eles aparecerao aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendaHoje.map((item) => (
                    <article key={item.id} className="dashboard-card-muted">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-gray-800">{item.paciente}</p>
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold uppercase text-gray-500">
                              {item.categoria}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.descricao}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-700">
                            {item.horario}
                          </span>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {ROTULOS_STATUS[item.status] || item.status}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <section className="dashboard-section">
                <div className="dashboard-section-header">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Stethoscope className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="dashboard-section-title">Sua unidade</h2>
                      <p className="dashboard-section-description">{nomeClinica}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="dashboard-card-muted">
                    <p className="text-sm text-gray-500">Especialidades da clinica</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {(clinicaVinculada?.especialidades || []).slice(0, 3).join(", ") ||
                        "Sem dados cadastrados"}
                    </p>
                  </div>
                  <div className="dashboard-card-muted">
                    <p className="text-sm text-gray-500">Horario de funcionamento</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {clinicaVinculada?.horario || "Nao informado"}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </section>
        )}
      </main>
      <MenuInferiorMedico abaAtiva="inicio" />
      <div className="h-24" />
    </div>
  );
}

export default HomeMedico;
