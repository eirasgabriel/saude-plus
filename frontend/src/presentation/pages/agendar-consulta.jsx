// TELA: Agendar consulta — alinhada à home do paciente (header azul, cards brancos, botões grandes)
// Horarios e confirmacao via camada de aplicacao consumindo o backend.

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";
import {
  listarHorariosAgenda,
  criarAgendamento,
} from "../../application/agenda/agendamento-use-cases";
import { obterUsuarioAtual } from "../../application/auth/auth-service";

function dataMinimaHoje() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatarDataPt(dataIso) {
  if (!dataIso) return "";
  const [y, m, d] = dataIso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AgendarConsulta() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const clinicaIdParam = params.get("clinica");

  const [clinica, setClinica] = useState(null);
  const [carregandoClinica, setCarregandoClinica] = useState(false);
  const [especialidade, setEspecialidade] = useState("");
  const [data, setData] = useState(dataMinimaHoje());
  const [horarioId, setHorarioId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroAcao, setErroAcao] = useState("");

  useEffect(() => {
    async function carregarClinica() {
      if (!clinicaIdParam) {
        setClinica(null);
        return;
      }

      setCarregandoClinica(true);
      setErroAcao("");
      try {
        setClinica(await buscarClinicaPorId(clinicaIdParam));
      } catch (erro) {
        setClinica(null);
        setErroAcao(erro.message || "Nao foi possivel carregar a clinica.");
      } finally {
        setCarregandoClinica(false);
      }
    }

    carregarClinica();
  }, [clinicaIdParam]);

  const carregarHorarios = useCallback(async () => {
    if (!clinica || !especialidade || !data) return;
    setCarregandoHorarios(true);
    setErroAcao("");
    try {
      const lista = await listarHorariosAgenda(
        clinica.id,
        data,
        null,
        especialidade
      );
      setHorarios(Array.isArray(lista) ? lista : []);
    } catch (e) {
      setHorarios([]);
      setErroAcao(e.message || "Não foi possível carregar os horários.");
    } finally {
      setCarregandoHorarios(false);
    }
  }, [clinica, data, especialidade]);

  useEffect(() => {
    carregarHorarios();
  }, [carregarHorarios]);

  useEffect(() => {
    setHorarioId(null);
  }, [data, especialidade]);

  useEffect(() => {
    if (clinica?.especialidades?.length && !especialidade) {
      setEspecialidade(clinica.especialidades[0]);
    }
  }, [clinica, especialidade]);

  function aoVoltar() {
    navigate("/paciente/inicio");
  }

  async function aoConfirmar(e) {
    e.preventDefault();
    if (!clinica || !especialidade || !data || !horarioId) return;

    const slot = horarios.find((h) => h.id === horarioId);
    if (!slot?.disponivel) return;

    const usuario = obterUsuarioAtual();
    const pacienteId = usuario?.id != null ? Number(usuario.id) : 1;

    setEnviando(true);
    setErroAcao("");
    try {
      await criarAgendamento({
        pacienteId,
        medicoId: slot.medico_id,
        agendaId: slot.id,
        clinicaId: clinica.id,
        observacoes,
        especialidade,
      });
      setSucesso(true);
      await carregarHorarios();
    } catch (err) {
      setErroAcao(err.message || "Falha ao agendar.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregandoClinica) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <p className="text-gray-500 text-sm">Carregando clinica...</p>
      </div>
    );
  }

  if (!clinicaIdParam || !clinica) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 relative">
        <div className="absolute right-5 top-10 bg-blue-400 rounded-full">
          <MenuUsuarioPaciente />
        </div>
        <p className="text-gray-600 text-center mb-6">
          Selecione uma clínica na lista para agendar.
        </p>
        <button
          type="button"
          onClick={() => navigate("/paciente/inicio")}
          className="bg-blue-400 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl"
        >
          Ver clínicas
        </button>
      </div>
    );
  }

  if (!clinica.aberta) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-blue-400 px-5 pt-10 pb-6 shadow-md">
          <div className="flex items-start justify-between gap-4 mb-4">
            <button
              type="button"
              onClick={aoVoltar}
              className="text-white text-sm font-medium flex items-center gap-2"
            >
              ← Voltar
            </button>
            <MenuUsuarioPaciente />
          </div>
          <h1 className="text-white text-2xl font-bold">Agendar consulta</h1>
        </header>
        <div className="p-6 text-center">
          <p className="text-gray-600">
            Esta unidade não está recebendo agendamentos no momento.
          </p>
        </div>
      </div>
    );
  }

  const horarioSelecionado = horarios.find((h) => h.id === horarioId);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-start justify-between gap-4 mb-3">
          <button
            type="button"
            onClick={aoVoltar}
            className="text-white text-sm font-medium flex items-center gap-2 active:opacity-80"
          >
            ← Voltar às clínicas
          </button>
          <MenuUsuarioPaciente />
        </div>
        <h1 className="text-white text-2xl font-bold leading-tight">
          Agendar consulta
        </h1>
        <p className="text-blue-100 text-sm mt-1">Escolha data e horário</p>
      </header>

      <main className="px-4 py-5 space-y-5">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            className={`h-1.5 w-full ${clinica.aberta ? "bg-green-400" : "bg-gray-300"}`}
          />
          <div className="p-5 flex gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
              {clinica.emoji}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{clinica.nome}</h2>
              <p className="text-blue-400 text-sm font-medium">{clinica.bairro}</p>
              <p className="text-gray-500 text-xs mt-1 flex items-start gap-1">
                <span>📍</span> {clinica.endereco}
              </p>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            Especialidade
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {clinica.especialidades.map((esp) => (
              <button
                key={esp}
                type="button"
                onClick={() => setEspecialidade(esp)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  especialidade === esp
                    ? "bg-blue-400 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
              >
                {esp}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Data da consulta
          </label>
          <input
            type="date"
            min={dataMinimaHoje()}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          {data && (
            <p className="text-gray-500 text-sm mt-2 capitalize">
              {formatarDataPt(data)}
            </p>
          )}
        </section>

        <section>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            Horários disponíveis
          </p>
          {carregandoHorarios ? (
            <p className="text-gray-500 text-sm py-6 text-center">Carregando…</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {horarios.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!slot.disponivel}
                  onClick={() => slot.disponivel && setHorarioId(slot.id)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                    !slot.disponivel
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                      : horarioId === slot.id
                        ? "bg-blue-400 text-white shadow-md ring-2 ring-blue-200"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 active:scale-95"
                  }`}
                >
                  {slot.hora}
                </button>
              ))}
            </div>
          )}
          <p className="text-gray-400 text-xs mt-3">
            Horários riscados já estão ocupados ou indisponíveis.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex.: primeira consulta, acompanhamento..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </section>

        {erroAcao && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{erroAcao}</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-lg z-20">
        <button
          type="button"
          disabled={
            !horarioSelecionado?.disponivel || enviando || carregandoHorarios
          }
          onClick={aoConfirmar}
          className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-[0.98]"
        >
          {enviando ? "Confirmando..." : "Confirmar agendamento"}
        </button>
      </div>

      {sucesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-8 text-center">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Agendamento registrado
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {clinica.nome}
              <br />
              {formatarDataPt(data)} às {horarioSelecionado?.hora}
              <br />
              <span className="text-blue-400 font-medium">{especialidade}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setSucesso(false);
                navigate("/paciente/inicio");
              }}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-xl"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendarConsulta;
