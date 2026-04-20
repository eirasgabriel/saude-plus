import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  alternarStatusClinica,
  listarClinicas,
  salvarClinica as salvarClinicaApi,
} from "../../application/clinicas/clinicas-use-cases";

const FORMULARIO_INICIAL = {
  nome: "",
  bairro: "",
  endereco: "",
  telefone: "",
  responsavel: "",
  especialidades: "",
  horario: "Seg a Sex: 07h as 17h",
  capacidadeDiaria: 40,
  status: "ativa",
};

function normalizarClinica(formulario, id = null) {
  return {
    id,
    nome: formulario.nome.trim(),
    bairro: formulario.bairro.trim(),
    endereco: formulario.endereco.trim(),
    telefone: formulario.telefone.trim(),
    responsavel: formulario.responsavel.trim(),
    especialidades: formulario.especialidades
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    horario: formulario.horario.trim(),
    capacidadeDiaria: Number(formulario.capacidadeDiaria) || 0,
    atendimentosMes: 0,
    satisfacao: 0,
    status: formulario.status,
    aberta: formulario.status === "ativa",
    emoji: "+",
  };
}

function AdminGerenciarClinicas() {
  const navigate = useNavigate();
  const [clinicas, setClinicas] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [clinicaEditandoId, setClinicaEditandoId] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregarClinicas() {
    setCarregando(true);
    setMensagem("");
    try {
      setClinicas(await listarClinicas());
    } catch (erro) {
      setMensagem(erro.message || "Nao foi possivel carregar as clinicas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClinicas();
  }, []);

  const resumo = useMemo(() => {
    const ativas = clinicas.filter((clinica) => clinica.status === "ativa").length;
    const capacidade = clinicas.reduce(
      (total, clinica) => total + Number(clinica.capacidadeDiaria || 0),
      0
    );
    const atendimentos = clinicas.reduce(
      (total, clinica) => total + Number(clinica.atendimentosMes || 0),
      0
    );

    return { ativas, capacidade, atendimentos };
  }, [clinicas]);

  function alterarCampo(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function limparFormulario() {
    setFormulario(FORMULARIO_INICIAL);
    setClinicaEditandoId(null);
  }

  async function salvarClinica(evento) {
    evento.preventDefault();
    setMensagem("");

    if (!formulario.nome.trim() || !formulario.bairro.trim()) {
      setMensagem("Informe pelo menos o nome e o bairro da clinica.");
      return;
    }

    try {
      await salvarClinicaApi(normalizarClinica(formulario, clinicaEditandoId));
      setMensagem(clinicaEditandoId ? "Clinica atualizada no backend." : "Clinica adicionada no backend.");
      limparFormulario();
      await carregarClinicas();
    } catch (erro) {
      setMensagem(erro.message || "Nao foi possivel salvar a clinica.");
    }
  }

  function editarClinica(clinica) {
    setClinicaEditandoId(clinica.id);
    setFormulario({
      nome: clinica.nome,
      bairro: clinica.bairro,
      endereco: clinica.endereco,
      telefone: clinica.telefone,
      responsavel: clinica.responsavel,
      especialidades: (clinica.especialidades || []).join(", "),
      horario: clinica.horario,
      capacidadeDiaria: clinica.capacidadeDiaria,
      status: clinica.status,
    });
    setMensagem("");
  }

  async function alternarStatus(clinicaId) {
    const clinica = clinicas.find((item) => item.id === clinicaId);
    if (!clinica) return;

    try {
      await alternarStatusClinica(clinica);
      await carregarClinicas();
    } catch (erro) {
      setMensagem(erro.message || "Nao foi possivel alterar o status.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-10 pb-6 sticky top-0 z-10 shadow-md">
        <button
          type="button"
          onClick={() => navigate("/admin/master")}
          className="text-blue-50 text-sm font-semibold mb-4"
        >
          Voltar ao painel
        </button>
        <p className="text-blue-100 text-sm">Admin Master</p>
        <h1 className="text-white text-2xl font-bold leading-tight">
          Gerenciar clinicas
        </h1>
        <p className="text-blue-100 text-sm mt-2">
          Cadastre, edite e acompanhe as unidades de saude do municipio.
        </p>
      </header>

      <main className="px-4 py-5 space-y-5">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Clinicas ativas</p>
            <strong className="text-3xl text-gray-800">{resumo.ativas}</strong>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Capacidade diaria</p>
            <strong className="text-3xl text-gray-800">{resumo.capacidade}</strong>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Atendimentos no mes</p>
            <strong className="text-3xl text-gray-800">{resumo.atendimentos}</strong>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
          <form
            onSubmit={salvarClinica}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {clinicaEditandoId ? "Editar unidade" : "Nova unidade"}
              </h2>
              <p className="text-gray-500 text-sm">
                Os dados ficam disponiveis no painel master.
              </p>
            </div>

            <input
              value={formulario.nome}
              onChange={(evento) => alterarCampo("nome", evento.target.value)}
              placeholder="Nome da clinica"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={formulario.bairro}
              onChange={(evento) => alterarCampo("bairro", evento.target.value)}
              placeholder="Bairro"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={formulario.endereco}
              onChange={(evento) => alterarCampo("endereco", evento.target.value)}
              placeholder="Endereco completo"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={formulario.telefone}
              onChange={(evento) => alterarCampo("telefone", evento.target.value)}
              placeholder="Telefone"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={formulario.responsavel}
              onChange={(evento) => alterarCampo("responsavel", evento.target.value)}
              placeholder="Responsavel tecnico"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <input
              value={formulario.especialidades}
              onChange={(evento) => alterarCampo("especialidades", evento.target.value)}
              placeholder="Especialidades separadas por virgula"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                value={formulario.capacidadeDiaria}
                onChange={(evento) => alterarCampo("capacidadeDiaria", evento.target.value)}
                placeholder="Capacidade diaria"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <select
                value={formulario.status}
                onChange={(evento) => alterarCampo("status", evento.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="ativa">Ativa</option>
                <option value="temporariamente_fechada">Temporariamente fechada</option>
              </select>
            </div>
            <input
              value={formulario.horario}
              onChange={(evento) => alterarCampo("horario", evento.target.value)}
              placeholder="Horario de funcionamento"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            {mensagem && (
              <p className="text-sm text-blue-600 bg-blue-50 rounded-xl px-4 py-3">
                {mensagem}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-400 text-white rounded-xl py-3 font-semibold hover:bg-blue-500 transition"
              >
                {clinicaEditandoId ? "Salvar edicao" : "Adicionar clinica"}
              </button>
              {clinicaEditandoId && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <section className="space-y-4">
            {clinicas.map((clinica) => (
              <article
                key={clinica.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-semibold text-gray-800">{clinica.nome}</h2>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          clinica.status === "ativa"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {clinica.status === "ativa" ? "Ativa" : "Fechada"}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1">{clinica.endereco}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {clinica.telefone} | {clinica.horario}
                    </p>
                    <p className="text-gray-600 text-sm mt-3">
                      Responsavel: <strong>{clinica.responsavel}</strong>
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Especialidades: {(clinica.especialidades || []).join(", ")}
                    </p>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => editarClinica(clinica)}
                      className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-xl font-semibold text-sm"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarStatus(clinica.id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold text-sm"
                    >
                      {clinica.status === "ativa" ? "Pausar" : "Reativar"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-500 text-xs">Capacidade</p>
                    <strong>{clinica.capacidadeDiaria}/dia</strong>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-500 text-xs">Mes</p>
                    <strong>{clinica.atendimentosMes}</strong>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-gray-500 text-xs">Satisfacao</p>
                    <strong>{clinica.satisfacao}%</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}

export default AdminGerenciarClinicas;
