import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { obterUsuarioAtual } from "../../application/auth/auth-service";
import { criarAgendamentoExame } from "../../application/exames/exames-use-cases";
import { buscarClinicaPorId } from "../../application/clinicas/clinicas-use-cases";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

const TIPOS_EXAMES = [
  "Hemograma completo",
  "Glicemia em jejum",
  "Colesterol total e fracoes",
  "Urina tipo 1",
  "Raio-X",
  "Ultrassonografia",
];

const HORARIOS_EXAMES = ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00"];

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
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AgendarExame() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const clinicaIdParam = params.get("clinica");
  const [clinica, setClinica] = useState(null);
  const [carregandoClinica, setCarregandoClinica] = useState(false);
  const [tipoExame, setTipoExame] = useState(TIPOS_EXAMES[0]);
  const [data, setData] = useState(dataMinimaHoje());
  const [horario, setHorario] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [sucesso, setSucesso] = useState(null);

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
        setErroAcao(erro.message || "Nao foi possivel carregar a unidade.");
      } finally {
        setCarregandoClinica(false);
      }
    }

    carregarClinica();
  }, [clinicaIdParam]);

  function aoVoltar() {
    navigate("/paciente/exames");
  }

  async function aoConfirmar(evento) {
    evento.preventDefault();
    if (!clinica || !tipoExame || !data || !horario) {
      setErroAcao("Escolha exame, data e horario para confirmar.");
      return;
    }

    const usuario = obterUsuarioAtual();
    const pacienteId = usuario?.id != null ? Number(usuario.id) : 1;

    setEnviando(true);
    setErroAcao("");
    try {
      const exame = await criarAgendamentoExame({
        pacienteId,
        clinicaId: clinica.id,
        clinicaNome: clinica.nome,
        clinicaBairro: clinica.bairro,
        tipo: tipoExame,
        data,
        horario,
        observacoes,
      });
      setSucesso(exame);
      setHorario("");
      setObservacoes("");
    } catch (erro) {
      setErroAcao(erro.message || "Falha ao agendar exame.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregandoClinica) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <p className="text-sm text-gray-500">Carregando unidade...</p>
      </div>
    );
  }

  if (!clinicaIdParam || !clinica) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <div className="absolute right-5 top-10 rounded-full bg-blue-400">
          <MenuUsuarioPaciente />
        </div>
        <p className="mb-6 text-center text-gray-600">
          Selecione uma unidade na aba Exames para agendar.
        </p>
        <button
          type="button"
          onClick={() => navigate("/paciente/exames")}
          className="rounded-xl bg-blue-400 px-8 py-3 font-bold text-white hover:bg-blue-500"
        >
          Ver unidades
        </button>
      </div>
    );
  }

  if (!clinica.aberta) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="bg-blue-400 px-5 pb-6 pt-10 shadow-md">
          <div className="mb-4 flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={aoVoltar}
              className="text-sm font-medium text-white"
            >
              Voltar
            </button>
            <MenuUsuarioPaciente />
          </div>
          <h1 className="text-2xl font-bold text-white">Agendar exame</h1>
        </header>
        <div className="p-6 text-center">
          <p className="text-gray-600">
            Esta unidade nao esta recebendo agendamentos no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="sticky top-0 z-10 bg-blue-400 px-5 pb-6 pt-12 shadow-md">
        <div className="mb-3 flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={aoVoltar}
            className="text-sm font-medium text-white active:opacity-80"
          >
            Voltar as unidades
          </button>
          <MenuUsuarioPaciente />
        </div>
        <h1 className="text-2xl font-bold leading-tight text-white">
          Agendar exame
        </h1>
        <p className="mt-1 text-sm text-blue-100">Escolha exame, data e horario</p>
      </header>

      <main className="space-y-5 px-4 py-5">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div
            className={`h-1.5 w-full ${clinica.aberta ? "bg-green-400" : "bg-gray-300"}`}
          />
          <div className="flex gap-4 p-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-3xl">
              {clinica.emoji || "+"}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">{clinica.nome}</h2>
              <p className="text-sm font-medium text-blue-400">{clinica.bairro}</p>
              <p className="mt-1 text-xs text-gray-500">{clinica.endereco}</p>
            </div>
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-medium uppercase text-gray-500">
            Tipo de exame
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TIPOS_EXAMES.map((exame) => (
              <button
                key={exame}
                type="button"
                onClick={() => setTipoExame(exame)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  tipoExame === exame
                    ? "bg-blue-400 text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                }`}
              >
                {exame}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Data do exame
          </label>
          <input
            type="date"
            min={dataMinimaHoje()}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {data && (
            <p className="mt-2 text-sm capitalize text-gray-500">
              {formatarDataPt(data)}
            </p>
          )}
        </section>

        <section>
          <p className="mb-3 text-xs font-medium uppercase text-gray-500">
            Horarios disponiveis
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {HORARIOS_EXAMES.map((hora) => (
              <button
                key={hora}
                type="button"
                onClick={() => setHorario(hora)}
                className={`rounded-xl py-3 text-sm font-semibold transition ${
                  horario === hora
                    ? "bg-blue-400 text-white shadow-md ring-2 ring-blue-200"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                }`}
              >
                {hora}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Observacoes (opcional)
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex.: pedido medico, orientacoes recebidas..."
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </section>

        {erroAcao && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{erroAcao}</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-100 bg-white px-4 py-4 shadow-lg">
        <button
          type="button"
          disabled={!horario || enviando}
          onClick={aoConfirmar}
          className="w-full rounded-xl bg-blue-400 py-4 text-lg font-bold text-white transition hover:bg-blue-500 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
        >
          {enviando ? "Confirmando..." : "Confirmar agendamento"}
        </button>
      </div>

      {sucesso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
            <div className="mb-4 text-5xl">+</div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">
              Exame agendado
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              {sucesso.tipo}
              <br />
              {sucesso.clinica_nome}
              <br />
              {formatarDataPt(sucesso.data)} as {sucesso.horario}
            </p>
            <button
              type="button"
              onClick={() => {
                setSucesso(null);
                navigate("/paciente/inicio");
              }}
              className="w-full rounded-xl bg-blue-400 py-3 font-bold text-white hover:bg-blue-500"
            >
              Voltar ao inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendarExame;
