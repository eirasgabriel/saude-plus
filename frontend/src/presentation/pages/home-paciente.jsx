import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, TestTube2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { buscarHistoricoPaciente } from "../../application/agenda/agendamento-use-cases";
import { obterUsuarioAtual } from "../../application/auth/auth-service";
import { listarExamesPaciente } from "../../application/exames/exames-use-cases";
import { ouvirClinicasAtualizadas } from "../../application/clinicas/clinicas-eventos";
import { listarClinicas } from "../../application/clinicas/clinicas-use-cases";
import CabecalhoApp from "../components/cabecalho-app";
import MenuInferiorPaciente from "../components/menu-inferior-paciente";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

function parseAgendaId(agendaId) {
  const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
    String(agendaId || "")
  );
  if (!parsed) return null;

  return {
    clinicaId: Number(parsed[1]),
    data: parsed[2],
    hora: `${parsed[3]}:${parsed[4]}`,
  };
}

function obterAgendaDaConsulta(consulta) {
  const agenda = parseAgendaId(consulta.agenda_id);
  if (agenda) return agenda;

  const data = consulta.data || consulta.data_consulta;
  const hora = consulta.hora || consulta.horario;
  if (!data || !hora) return null;

  return {
    clinicaId: Number(consulta.clinica_id),
    data,
    hora,
  };
}

function paraInicioDoDia(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatarData(dataIso) {
  const [y, m, d] = dataIso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function HomePaciente() {
  const navigate = useNavigate();
  const usuario = obterUsuarioAtual();
  const nomeUsuario = usuario?.nome || "Paciente";
  const [consultas, setConsultas] = useState([]);
  const [exames, setExames] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDashboard() {
    const pacienteId = usuario?.id != null ? Number(usuario.id) : 1;
    setCarregando(true);
    setErro("");

    try {
      const [listaConsultas, listaClinicas, listaExames] = await Promise.all([
        buscarHistoricoPaciente(pacienteId),
        listarClinicas(),
        listarExamesPaciente(pacienteId),
      ]);
      setConsultas(Array.isArray(listaConsultas) ? listaConsultas : []);
      setClinicas(Array.isArray(listaClinicas) ? listaClinicas : []);
      setExames(Array.isArray(listaExames) ? listaExames : []);
    } catch (e) {
      setErro(e.message || "Nao foi possivel carregar suas consultas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, [usuario?.id]);

  useEffect(() => ouvirClinicasAtualizadas(carregarDashboard), [usuario?.id]);

  const consultasFuturas = useMemo(() => {
    const hoje = paraInicioDoDia(new Date());
    return consultas
      .map((consulta) => {
        const agenda = obterAgendaDaConsulta(consulta);
        if (!agenda) return null;

        const clinica =
          clinicas.find((c) => Number(c.id) === Number(agenda.clinicaId)) ||
          clinicas.find((c) => Number(c.id) === Number(consulta.clinica_id));
        const dataConsulta = paraInicioDoDia(new Date(`${agenda.data}T00:00:00`));

        return {
          ...consulta,
          clinicaNome: clinica?.nome || "Clinica nao identificada",
          clinicaBairro: clinica?.bairro || "-",
          data: agenda.data,
          hora: agenda.hora,
          ehFutura: dataConsulta >= hoje && consulta.status !== "cancelada",
        };
      })
      .filter((consulta) => consulta && consulta.ehFutura)
      .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
  }, [clinicas, consultas]);

  const proximosExames = useMemo(() => {
    const hoje = paraInicioDoDia(new Date());
    return exames
      .filter((exame) => {
        const dataExame = paraInicioDoDia(new Date(`${exame.data}T00:00:00`));
        return dataExame >= hoje && exame.status !== "cancelado";
      })
      .map((exame) => {
        const clinica = clinicas.find(
          (item) => Number(item.id) === Number(exame.clinica_id)
        );

        return {
          ...exame,
          clinica_nome: clinica?.nome || exame.clinica_nome,
          clinica_bairro: clinica?.bairro || exame.clinica_bairro,
        };
      })
      .sort((a, b) =>
        `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`)
      );
  }, [clinicas, exames]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CabecalhoApp
        contexto={`Ola, ${nomeUsuario}`}
        titulo="Sua dashboard"
        descricao="Acompanhe seus proximos atendimentos"
        acao={<MenuUsuarioPaciente />}
      />

      <main className="app-content dashboard-shell">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
              <h2 className="dashboard-section-title">Proximas consultas</h2>
              <p className="dashboard-section-description">
                Agendamentos futuros confirmados para voce
              </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/paciente/consultas")}
              className="dashboard-action"
            >
              <span>Agendar</span>
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {carregando && (
            <p className="py-8 text-center text-sm text-gray-500">
              Carregando consultas...
            </p>
          )}

          {!carregando && erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          {!carregando && !erro && consultasFuturas.length === 0 && (
            <div className="dashboard-card-muted text-center">
              <p className="font-semibold text-gray-700">Nenhuma consulta futura</p>
              <p className="mt-1 text-sm text-gray-500">
                Seus proximos agendamentos aparecerao aqui.
              </p>
            </div>
          )}

          {!carregando && !erro && consultasFuturas.length > 0 && (
            <div className="space-y-3">
              {consultasFuturas.map((consulta) => (
                <article
                  key={consulta.id}
                  className="dashboard-card-muted"
                >
                  <p className="font-bold text-gray-800">{consulta.clinicaNome}</p>
                  <p className="mt-1 text-sm text-gray-500">{consulta.clinicaBairro}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Data:</span>{" "}
                      {formatarData(consulta.data)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Hora:</span> {consulta.hora}
                    </p>
                  </div>
                  {consulta.especialidade && (
                    <p className="mt-2 text-xs font-medium text-blue-500">
                      {consulta.especialidade}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-header">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TestTube2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
              <h2 className="dashboard-section-title">Proximos exames</h2>
              <p className="dashboard-section-description">
                Solicitacoes e resultados previstos
              </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/paciente/exames")}
              className="dashboard-action"
            >
              <span>Ver exames</span>
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {proximosExames.length === 0 ? (
            <div className="dashboard-card-muted text-center">
              <p className="font-semibold text-gray-700">Nenhum exame futuro</p>
              <p className="mt-1 text-sm text-gray-500">
                Seus proximos exames aparecerao aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximosExames.map((exame) => (
                <article
                  key={exame.id}
                  className="dashboard-card-muted"
                >
                  <p className="font-bold text-gray-800">{exame.tipo}</p>
                  <p className="mt-1 text-sm text-gray-500">{exame.clinica_nome}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Data:</span>{" "}
                      {formatarData(exame.data)}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Hora:</span> {exame.horario}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        </div>
      </main>

      <MenuInferiorPaciente abaAtiva="inicio" />
      <div className="h-24" />
    </div>
  );
}

export default HomePaciente;
