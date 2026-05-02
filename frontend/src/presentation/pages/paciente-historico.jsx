import React, { useEffect, useMemo, useState } from "react";
import { buscarHistoricoPaciente } from "../../application/agenda/agendamento-use-cases";
import { obterUsuarioAtual } from "../../application/auth/auth-service";
import { ouvirClinicasAtualizadas } from "../../application/clinicas/clinicas-eventos";
import { listarClinicas } from "../../application/clinicas/clinicas-use-cases";
import { listarExamesPaciente } from "../../application/exames/exames-use-cases";
import CabecalhoApp from "../components/cabecalho-app";
import MenuInferiorPaciente from "../components/menu-inferior-paciente";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

const CHAVE_CONSULTAS_OCULTAS = "saude_plus_consultas_historico_ocultas";
const CHAVE_EXAMES_OCULTOS = "saude_plus_exames_historico_ocultos";

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
  if (data && hora) {
    return {
      clinicaId: Number(consulta.clinica_id),
      data,
      hora,
    };
  }

  return null;
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

function lerConsultasOcultas() {
  if (typeof window === "undefined") return [];

  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_CONSULTAS_OCULTAS) || "[]");
    return Array.isArray(dados) ? dados.map(String) : [];
  } catch {
    return [];
  }
}

function salvarConsultasOcultas(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_CONSULTAS_OCULTAS, JSON.stringify(ids));
}

function lerExamesOcultos() {
  if (typeof window === "undefined") return [];

  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_EXAMES_OCULTOS) || "[]");
    return Array.isArray(dados) ? dados.map(String) : [];
  } catch {
    return [];
  }
}

function salvarExamesOcultos(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_EXAMES_OCULTOS, JSON.stringify(ids));
}

function PacienteHistorico() {
  const [consultas, setConsultas] = useState([]);
  const [exames, setExames] = useState([]);
  const [consultasOcultas, setConsultasOcultas] = useState(lerConsultasOcultas);
  const [examesOcultos, setExamesOcultos] = useState(lerExamesOcultos);
  const [clinicas, setClinicas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarHistorico() {
    const usuario = obterUsuarioAtual();
    const pacienteId = usuario?.id != null ? Number(usuario.id) : 1;
    setCarregando(true);
    setErro("");

    try {
      const [listaConsultas, listaClinicas, listaExames] = await Promise.all([
        buscarHistoricoPaciente(pacienteId),
        listarClinicas(),
        listarExamesPaciente(pacienteId),
      ]);
      const consultasCarregadas = Array.isArray(listaConsultas) ? listaConsultas : [];
      const examesCarregados = Array.isArray(listaExames) ? listaExames : [];

      setConsultas(consultasCarregadas);
      setExames(examesCarregados);
      setClinicas(Array.isArray(listaClinicas) ? listaClinicas : []);
    } catch (e) {
      setErro(e.message || "Nao foi possivel carregar seu historico.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => ouvirClinicasAtualizadas(carregarHistorico), []);

  const consultasHistorico = useMemo(() => {
    const hoje = paraInicioDoDia(new Date());
    const consultasOcultasSet = new Set(consultasOcultas);
    return consultas
      .map((consulta) => {
        if (consultasOcultasSet.has(String(consulta.id))) return null;

        const agenda = obterAgendaDaConsulta(consulta);
        if (!agenda) return null;

        const clinica =
          clinicas.find((c) => Number(c.id) === Number(agenda.clinicaId)) ||
          clinicas.find((c) => Number(c.id) === Number(consulta.clinica_id));
        const dataConsulta = paraInicioDoDia(new Date(`${agenda.data}T00:00:00`));
        const consultaEncerrada =
          dataConsulta < hoje ||
          ["realizada", "cancelada"].includes(String(consulta.status || "").toLowerCase());

        if (!consultaEncerrada) return null;

        return {
          ...consulta,
          clinicaNome: clinica?.nome || "Clinica nao identificada",
          data: agenda.data,
          hora: agenda.hora,
          status: consulta.status || "realizada",
        };
      })
      .filter(Boolean)
      .sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`));
  }, [clinicas, consultas, consultasOcultas]);

  const examesHistorico = useMemo(() => {
    const examesOcultosSet = new Set(examesOcultos);
    return exames
      .filter((exame) => !examesOcultosSet.has(String(exame.id)))
      .map((exame) => ({
        ...exame,
        data: exame.data || "",
        horario: exame.horario || "-",
        status: exame.status || "agendado",
      }))
      .sort((a, b) =>
        `${b.data} ${b.horario}`.localeCompare(`${a.data} ${a.horario}`)
      );
  }, [exames, examesOcultos]);

  function excluirConsultaDoHistorico(consultaId) {
    const proximasConsultasOcultas = [
      ...new Set([...consultasOcultas, String(consultaId)]),
    ];
    setConsultasOcultas(proximasConsultasOcultas);
    salvarConsultasOcultas(proximasConsultasOcultas);
  }

  function excluirExameDoHistorico(exameId) {
    const proximosExamesOcultos = [...new Set([...examesOcultos, String(exameId)])];
    setExamesOcultos(proximosExamesOcultos);
    salvarExamesOcultos(proximosExamesOcultos);
    setExames((atuais) =>
      atuais.filter((exame) => String(exame.id) !== String(exameId))
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CabecalhoApp
        titulo="Histórico"
        descricao="Consultas e exames anteriores em um só lugar"
        acao={<MenuUsuarioPaciente />}
      />

      <main className="app-content grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Consultas</h2>
            <p className="text-sm text-gray-500">Atendimentos ja encerrados</p>
          </div>

          {carregando && (
            <p className="rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-sm">
              Carregando consultas...
            </p>
          )}

          {!carregando && erro && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          {!carregando && !erro && consultasHistorico.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="font-semibold text-gray-700">Nenhuma consulta no historico</p>
              <p className="mt-1 text-sm text-gray-500">
                Consultas realizadas ou canceladas aparecerao aqui.
              </p>
            </div>
          )}

          {!carregando &&
            !erro &&
            consultasHistorico.map((consulta) => (
              <div
                key={consulta.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-gray-800">{consulta.clinicaNome}</p>
                  <button
                    type="button"
                    onClick={() => excluirConsultaDoHistorico(consulta.id)}
                    className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-100"
                  >
                    Deletar
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold">Data:</span> {formatarData(consulta.data)}
                  </p>
                  <p>
                    <span className="font-semibold">Hora:</span> {consulta.hora}
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold">Status:</span> {consulta.status}
                </p>
              </div>
            ))}
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Exames</h2>
            <p className="text-sm text-gray-500">Exames registrados no sistema</p>
          </div>

          {examesHistorico.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="font-semibold text-gray-700">Nenhum exame no historico</p>
              <p className="mt-1 text-sm text-gray-500">
                Quando houver exames agendados ou finalizados, eles aparecerao nesta coluna.
              </p>
            </div>
          )}

          {examesHistorico.map((exame) => (
            <div
              key={exame.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-800">{exame.tipo}</p>
                  <p className="mt-1 text-sm text-gray-500">{exame.clinica_nome}</p>
                </div>
                <button
                  type="button"
                  onClick={() => excluirExameDoHistorico(exame.id)}
                  className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-100"
                >
                  Deletar
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <p>
                  <span className="font-semibold">Data:</span>{" "}
                  {exame.data ? formatarData(exame.data) : "-"}
                </p>
                <p>
                  <span className="font-semibold">Hora:</span> {exame.horario}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">Status:</span> {exame.status}
              </p>
            </div>
          ))}
        </section>
      </main>

      <MenuInferiorPaciente abaAtiva="historico" />
      <div className="h-24" />
    </div>
  );
}

export default PacienteHistorico;
