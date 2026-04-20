import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarClinicas } from "../../application/clinicas/clinicas-use-cases";
import MenuInferiorPaciente from "../components/menu-inferior-paciente";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

function PacienteExames() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState("");
  const [clinicas, setClinicas] = useState([]);
  const [clinicasFiltradas, setClinicasFiltradas] = useState([]);
  const [bairroSelecionado, setBairroSelecionado] = useState("Todos");
  const [filtroBuscaAberto, setFiltroBuscaAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [clinicaInfoAberta, setClinicaInfoAberta] = useState(null);

  const todosBairros = [
    "Todos",
    ...new Set(clinicas.map((clinica) => clinica.bairro).filter(Boolean)),
  ];

  const quantidadeFiltrosAtivos = bairroSelecionado !== "Todos" ? 1 : 0;

  useEffect(() => {
    async function carregarClinicas() {
      setCarregando(true);
      setErroCarregamento("");

      try {
        const lista = await listarClinicas();
        const clinicasDisponiveis = Array.isArray(lista) ? lista : [];
        setClinicas(clinicasDisponiveis);
        setClinicasFiltradas(clinicasDisponiveis);
      } catch (erro) {
        setErroCarregamento(erro.message || "Nao foi possivel carregar as unidades.");
      } finally {
        setCarregando(false);
      }
    }

    carregarClinicas();
  }, []);

  useEffect(() => {
    const termo = termoBusca.toLowerCase().trim();
    const resultado = clinicas.filter((clinica) => {
      const nome = String(clinica.nome || "").toLowerCase();
      const bairro = String(clinica.bairro || "").toLowerCase();
      const bateTexto = !termo || nome.includes(termo) || bairro.includes(termo);
      const bateBairro =
        bairroSelecionado === "Todos" || clinica.bairro === bairroSelecionado;

      return bateTexto && bateBairro;
    });

    setClinicasFiltradas(resultado);
  }, [bairroSelecionado, clinicas, termoBusca]);

  function aoClicarAgendar(clinica) {
    navigate(`/paciente/agendar-exame?clinica=${clinica.id}`);
  }

  function limparFiltrosPesquisa() {
    setTermoBusca("");
    setBairroSelecionado("Todos");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-blue-400 px-5 pb-6 pt-12 shadow-md">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-white">Exames</h1>
            <p className="mt-1 text-sm text-blue-100">
              Escolha uma unidade para agendar seu exame
            </p>
          </div>
          <MenuUsuarioPaciente />
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
            Buscar
          </span>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Unidade ou bairro..."
            className="w-full rounded-2xl bg-white py-3.5 pl-20 pr-24 text-base text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {termoBusca && (
            <button
              type="button"
              onClick={() => setTermoBusca("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-gray-400"
              aria-label="Limpar busca"
            >
              X
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltroBuscaAberto((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 transition ${
              filtroBuscaAberto || quantidadeFiltrosAtivos > 0
                ? "bg-blue-100 text-blue-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            aria-label="Abrir filtros de pesquisa"
          >
            <span className="relative flex h-5 w-5 items-end justify-center gap-0.5">
              <span className="h-2 w-1 rounded-full bg-current" />
              <span className="h-3.5 w-1 rounded-full bg-current" />
              <span className="h-5 w-1 rounded-full bg-current" />
              {quantidadeFiltrosAtivos > 0 && (
                <span className="absolute -right-2 -top-2 h-4 min-w-4 rounded-full bg-blue-500 px-1 text-center text-[10px] leading-4 text-white">
                  {quantidadeFiltrosAtivos}
                </span>
              )}
            </span>
          </button>
        </div>

        {filtroBuscaAberto && (
          <div className="mt-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Filtros de pesquisa</p>
                <p className="text-xs text-gray-400">Refine por bairro</p>
              </div>
              {quantidadeFiltrosAtivos > 0 && (
                <button
                  type="button"
                  onClick={limparFiltrosPesquisa}
                  className="text-xs font-semibold text-blue-500"
                >
                  Limpar
                </button>
              )}
            </div>

            <p className="mb-2 text-xs font-medium uppercase text-gray-500">
              Bairros
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {todosBairros.map((bairro) => (
                <button
                  key={bairro}
                  type="button"
                  onClick={() => setBairroSelecionado(bairro)}
                  className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    bairroSelecionado === bairro
                      ? "bg-blue-400 text-white shadow-md"
                      : "border border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  {bairro}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-5">
        {carregando && (
          <p className="py-6 text-center text-sm text-gray-500">
            Carregando unidades...
          </p>
        )}

        {!carregando && erroCarregamento && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{erroCarregamento}</p>
          </div>
        )}

        {!carregando && !erroCarregamento && (
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {clinicasFiltradas.length === 0
                ? "Nenhuma unidade encontrada"
                : `${clinicasFiltradas.length} unidade${
                    clinicasFiltradas.length > 1 ? "s" : ""
                  } disponivel${clinicasFiltradas.length > 1 ? "s" : ""}`}
            </p>
            <p className="text-xs font-medium text-blue-400">Saquarema/RJ</p>
          </div>
        )}

        {!carregando && !erroCarregamento && clinicasFiltradas.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-base font-medium text-gray-500">
              Nenhuma unidade encontrada
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Tente outro nome ou bairro
            </p>
            <button
              type="button"
              onClick={limparFiltrosPesquisa}
              className="mt-4 text-sm font-medium text-blue-400 underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

        <div className="space-y-4">
          {clinicasFiltradas.map((clinica) => (
            <article
              key={clinica.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div
                className={`h-1.5 w-full ${clinica.aberta ? "bg-green-400" : "bg-gray-300"}`}
              />

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      {clinica.emoji || "+"}
                    </div>
                    <div>
                      <h2 className="text-base font-bold leading-tight text-gray-800">
                        {clinica.nome}
                      </h2>
                      <p className="text-sm font-medium text-blue-400">
                        {clinica.bairro}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      clinica.aberta
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {clinica.aberta ? "Aberta" : "Fechada"}
                  </span>
                </div>

                <p className="mb-2 text-xs text-gray-500">
                  <span className="font-semibold">Horario:</span> {clinica.horario}
                </p>
                <p className="mb-3 text-xs text-gray-500">
                  <span className="font-semibold">Endereco:</span> {clinica.endereco}
                </p>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {["Coleta", "Exames laboratoriais", "Resultados"].map((servico) => (
                    <span
                      key={servico}
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-600"
                    >
                      {servico}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${clinica.telefone}`}
                    className="flex flex-1 items-center justify-center rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    Ligar
                  </a>
                  <button
                    type="button"
                    onClick={() => setClinicaInfoAberta(clinica)}
                    className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300"
                  >
                    Mais info
                  </button>
                  <button
                    type="button"
                    onClick={() => aoClicarAgendar(clinica)}
                    disabled={!clinica.aberta}
                    className={`flex-[1.6] rounded-xl py-3 text-base font-bold transition active:scale-95 ${
                      clinica.aberta
                        ? "bg-blue-400 text-white shadow-sm hover:bg-blue-500"
                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                    }`}
                  >
                    {clinica.aberta ? "Agendar" : "Indisponivel"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <MenuInferiorPaciente abaAtiva="exames" />

      {clinicaInfoAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="mb-1 text-lg font-bold text-gray-800">
              {clinicaInfoAberta.emoji || "+"} {clinicaInfoAberta.nome}
            </h3>
            <p className="mb-4 text-sm font-medium text-blue-500">
              {clinicaInfoAberta.bairro}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Endereco:</span>{" "}
                {clinicaInfoAberta.endereco}
              </p>
              <p>
                <span className="font-semibold">Telefone:</span>{" "}
                {clinicaInfoAberta.telefone}
              </p>
              <p>
                <span className="font-semibold">Funcionamento:</span>{" "}
                {clinicaInfoAberta.horario}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setClinicaInfoAberta(null)}
              className="mt-5 w-full rounded-xl bg-blue-400 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}

export default PacienteExames;
