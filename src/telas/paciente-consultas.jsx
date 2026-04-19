import React, { useEffect, useMemo, useState } from "react";
import { buscarHistoricoPaciente } from "../logica-de-controle/agenda";
import { obterUsuarioAtual } from "../logica-de-controle/auth";
import { CLINICAS_SAQUAREMA, buscarClinicaPorId } from "../dados/clinicas-mock";
import MenuInferiorPaciente from "../componentes/menu-inferior-paciente";

function parseAgendaId(agendaId) {
  const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
    String(agendaId || "")
  );
  if (!parsed) return null;
  const clinicaId = Number(parsed[1]);
  const data = parsed[2];
  const hora = `${parsed[3]}:${parsed[4]}`;
  return { clinicaId, data, hora };
}

function paraInicioDoDia(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function PacienteConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      const usuario = obterUsuarioAtual();
      const pacienteId = usuario?.id != null ? Number(usuario.id) : 1;
      setCarregando(true);
      setErro("");
      try {
        const lista = await buscarHistoricoPaciente(pacienteId);
        setConsultas(Array.isArray(lista) ? lista : []);
      } catch (e) {
        setErro(e.message || "Não foi possível carregar suas consultas.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const consultasFuturas = useMemo(() => {
    const hoje = paraInicioDoDia(new Date());
    return consultas
      .map((consulta) => {
        const agenda = parseAgendaId(consulta.agenda_id);
        if (!agenda) return null;
        const clinica =
          buscarClinicaPorId(agenda.clinicaId) ||
          CLINICAS_SAQUAREMA.find((c) => Number(c.id) === Number(consulta.clinica_id));
        const dataConsulta = paraInicioDoDia(new Date(`${agenda.data}T00:00:00`));
        return {
          ...consulta,
          clinicaNome: clinica?.nome || "Clínica não identificada",
          clinicaBairro: clinica?.bairro || "-",
          data: agenda.data,
          hora: agenda.hora,
          ehFutura: dataConsulta >= hoje && consulta.status !== "cancelada",
        };
      })
      .filter((c) => c && c.ehFutura)
      .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
  }, [consultas]);

  function formatarData(dataIso) {
    const [y, m, d] = dataIso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <h1 className="text-white text-2xl font-bold leading-tight">Próximas consultas</h1>
        <p className="text-blue-100 text-sm mt-1">
          Agendamentos futuros confirmados para você
        </p>
      </header>

      <main className="px-4 py-5 space-y-3">
        {carregando && (
          <p className="text-center text-sm text-gray-500 py-10">Carregando consultas...</p>
        )}

        {!carregando && erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{erro}</p>
          </div>
        )}

        {!carregando && !erro && consultasFuturas.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
            <p className="text-gray-700 font-semibold">Nenhuma consulta futura</p>
            <p className="text-gray-500 text-sm mt-1">
              Seus próximos agendamentos aparecerão aqui.
            </p>
          </div>
        )}

        {!carregando &&
          !erro &&
          consultasFuturas.map((consulta) => (
            <div
              key={consulta.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <p className="font-bold text-gray-800">{consulta.clinicaNome}</p>
              <p className="text-sm text-gray-500 mt-1">{consulta.clinicaBairro}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Data:</span> {formatarData(consulta.data)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Hora:</span> {consulta.hora}
                </p>
              </div>
              {consulta.especialidade && (
                <p className="mt-2 text-xs text-blue-500 font-medium">{consulta.especialidade}</p>
              )}
            </div>
          ))}
      </main>

      <MenuInferiorPaciente abaAtiva="consultas" />
      <div className="h-24" />
    </div>
  );
}

export default PacienteConsultas;
