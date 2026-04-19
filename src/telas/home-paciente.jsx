
// TELA: Home do Paciente 
// Lista as clínicas disponíveis em Saquarema
// Layout 100% mobile-friendly: botões grandes, leitura fácil


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CLINICAS_SAQUAREMA } from "../dados/clinicas-mock";
import MenuInferiorPaciente from "../componentes/menu-inferior-paciente";
import { obterUsuarioAtual, realizarLogout } from "../logica-de-controle/auth";

/**
 * Tela principal do Paciente
 * Mostra saudação, barra de busca e lista de clínicas
 */
function HomePaciente() {
  const navigate = useNavigate();
  const usuario = obterUsuarioAtual();

  // Simula o nome do usuário logado (virá do contexto de autenticação)
  const nomeUsuario = usuario?.nome || "Paciente";

  // Estado da busca por clínica
  const [termoBusca, setTermoBusca] = useState("");

  // Estado das clínicas filtradas
  const [clinicasFiltradas, setClinicasFiltradas] = useState(CLINICAS_SAQUAREMA);

  // Estado do filtro de especialidade selecionada
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState("Todas");
  const [bairroSelecionado, setBairroSelecionado] = useState("Todos");
  const [filtroBuscaAberto, setFiltroBuscaAberto] = useState(false);

  // Estado de carregamento (para simular busca na API futuramente)
  const [carregando, setCarregando] = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [clinicaInfoAberta, setClinicaInfoAberta] = useState(null);

  // Lista única de todas as especialidades disponíveis
  const todasEspecialidades = [
    "Todas",
    ...new Set(CLINICAS_SAQUAREMA.flatMap((c) => c.especialidades)),
  ];

  const todosBairros = [
    "Todos",
    ...new Set(CLINICAS_SAQUAREMA.map((c) => c.bairro)),
  ];

  const quantidadeFiltrosAtivos =
    (especialidadeSelecionada !== "Todas" ? 1 : 0) +
    (bairroSelecionado !== "Todos" ? 1 : 0);

  // Filtra as clínicas sempre que o termo de busca ou
  // a especialidade selecionada mudar

  useEffect(() => {
    const termo = termoBusca.toLowerCase().trim();

    const resultado = CLINICAS_SAQUAREMA.filter((clinica) => {
      // Filtra por texto (nome ou bairro)
      const bateTexto =
        !termo ||
        clinica.nome.toLowerCase().includes(termo) ||
        clinica.bairro.toLowerCase().includes(termo);

      // Filtra por especialidade selecionada
      const bateEspecialidade =
        especialidadeSelecionada === "Todas" ||
        clinica.especialidades.includes(especialidadeSelecionada);

      const bateBairro =
        bairroSelecionado === "Todos" ||
        clinica.bairro === bairroSelecionado;

      return bateTexto && bateEspecialidade && bateBairro;
    });

    setClinicasFiltradas(resultado);
  }, [termoBusca, especialidadeSelecionada, bairroSelecionado]);

  /**
   * Navega para a tela de agendamento da clínica selecionada
   * @param {object} clinica - Dados da clínica escolhida
   */
  function aoClicarAgendar(clinica) {
    navigate(`/paciente/agendar?clinica=${clinica.id}`);
  }

  function irParaPerfil() {
    setMenuUsuarioAberto(false);
    navigate("/paciente/perfil");
  }

  function sairDaConta() {
    setMenuUsuarioAberto(false);
    realizarLogout();
  }

  function limparFiltrosPesquisa() {
    setTermoBusca("");
    setEspecialidadeSelecionada("Todas");
    setBairroSelecionado("Todos");
  }

  
  // RENDERIZAÇÃO DA TELA
  
  return (
    // Fundo suave, scrollável verticalmente no celular
    <div className="min-h-screen bg-gray-50">

      {/* ---- CABEÇALHO FIXO ---- */}
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        
        {/* Saudação personalizada + ícone de notificação */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">Olá, {nomeUsuario} 👋</p>
            <h1 className="text-white text-2xl font-bold leading-tight">
              Qual clínica você precisa?
            </h1>
          </div>
          {/* Botão de perfil do paciente */}
          <div className="relative z-30">
            <button
              type="button"
              onClick={() => setMenuUsuarioAberto((v) => !v)}
              className="w-11 h-11 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl"
              aria-label="Perfil do usuário"
            >
              👤
            </button>
            {menuUsuarioAberto && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40">
                <button
                  type="button"
                  onClick={irParaPerfil}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Meu perfil
                </button>
                <button
                  type="button"
                  onClick={sairDaConta}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra de busca — grande e fácil de tocar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </span>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar clínica ou bairro..."
            className="w-full bg-white rounded-2xl pl-11 pr-24 py-3.5 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
          />
          {/* Botão de limpar busca */}
          {termoBusca && (
            <button
              type="button"
              onClick={() => setTermoBusca("")}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltroBuscaAberto((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 transition ${
              filtroBuscaAberto || quantidadeFiltrosAtivos > 0
                ? "bg-blue-100 text-blue-600"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            aria-label="Abrir filtros de pesquisa"
          >
            <span className="relative flex h-5 w-5 items-end justify-center gap-0.5">
              <span className="w-1 h-2 rounded-full bg-current" />
              <span className="w-1 h-3.5 rounded-full bg-current" />
              <span className="w-1 h-5 rounded-full bg-current" />
              {quantidadeFiltrosAtivos > 0 && (
                <span className="absolute -right-2 -top-2 min-w-4 h-4 rounded-full bg-blue-500 px-1 text-[10px] leading-4 text-white text-center">
                  {quantidadeFiltrosAtivos}
                </span>
              )}
            </span>
          </button>
        </div>

        {filtroBuscaAberto && (
          <div className="mt-3 bg-white rounded-2xl shadow-lg border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-gray-800">Filtros de pesquisa</p>
                <p className="text-xs text-gray-400">Refine por especialidade e bairro</p>
              </div>
              {quantidadeFiltrosAtivos > 0 && (
                <button
                  type="button"
                  onClick={limparFiltrosPesquisa}
                  className="text-xs text-blue-500 font-semibold"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
                Especialidades
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {todasEspecialidades.map((esp) => (
                  <button
                    key={esp}
                    type="button"
                    onClick={() => setEspecialidadeSelecionada(esp)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      especialidadeSelecionada === esp
                        ? "bg-blue-400 text-white shadow-md"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {esp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
                Bairros
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {todosBairros.map((bairro) => (
                  <button
                    key={bairro}
                    type="button"
                    onClick={() => setBairroSelecionado(bairro)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      bairroSelecionado === bairro
                        ? "bg-blue-400 text-white shadow-md"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {bairro}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---- CONTEÚDO PRINCIPAL ---- */}
      <main className="px-4 py-5">

        {/* Contagem de resultados */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            {clinicasFiltradas.length === 0
              ? "Nenhuma clínica encontrada"
              : `${clinicasFiltradas.length} clínica${clinicasFiltradas.length > 1 ? "s" : ""} disponível${clinicasFiltradas.length > 1 ? "s" : ""}`}
          </p>
          <p className="text-blue-400 text-xs font-medium">Saquarema/RJ</p>
        </div>

        {/* Estado vazio — quando a busca não encontra nada */}
        {clinicasFiltradas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-500 text-base font-medium">
              Nenhuma clínica encontrada
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Tente outro nome, especialidade ou bairro
            </p>
            <button
              type="button"
              onClick={limparFiltrosPesquisa}
              className="mt-4 text-blue-400 text-sm font-medium underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* ---- LISTA DE CLÍNICAS ---- */}
        <div className="space-y-4">
          {clinicasFiltradas.map((clinica) => (
            <div
              key={clinica.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Faixa colorida de status no topo do card */}
              <div
                className={`h-1.5 w-full ${clinica.aberta ? "bg-green-400" : "bg-gray-300"}`}
              />

              <div className="p-5">
                {/* Cabeçalho do card: nome + badge de status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Emoji representativo da clínica */}
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
                      {clinica.emoji}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800 leading-tight">
                        {clinica.nome}
                      </h2>
                      <p className="text-blue-400 text-sm font-medium">{clinica.bairro}</p>
                    </div>
                  </div>

                  {/* Badge: Aberta / Fechada */}
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                      clinica.aberta
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {clinica.aberta ? "✓ Aberta" : "✕ Fechada"}
                  </span>
                </div>

                {/* Horário de funcionamento */}
                <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                  <span>🕐</span> {clinica.horario}
                </p>

                {/* Endereço */}
                <p className="text-gray-500 text-xs mb-3 flex items-start gap-1">
                  <span>📍</span> {clinica.endereco}
                </p>

                {/* Tags de especialidades */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {clinica.especialidades.map((esp, i) => (
                    <span
                      key={i}
                      className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full"
                    >
                      {esp}
                    </span>
                  ))}
                </div>

                {/* Botões de ação — grandes para facilitar o toque */}
                <div className="flex gap-2">
                  {/* Botão de ligar — abre discador nativo do celular */}
                  <a
                    href={`tel:${clinica.telefone}`}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:bg-gray-200 transition"
                  >
                    📞 Ligar
                  </a>

                  {/* Botão de mais informações da clínica */}
                  <button
                    type="button"
                    onClick={() => setClinicaInfoAberta(clinica)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 hover:border-blue-300 transition"
                  >
                    ℹ️ Mais info
                  </button>

                  {/* Botão principal de agendamento */}
                  <button
                    onClick={() => aoClicarAgendar(clinica)}
                    disabled={!clinica.aberta}
                    className={`flex-[1.6] font-bold py-3 rounded-xl text-base transition-all duration-200 active:scale-95 ${
                      clinica.aberta
                        ? "bg-blue-400 text-white hover:bg-blue-500 shadow-sm"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {clinica.aberta ? "Agendar Consulta" : "Indisponível"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <MenuInferiorPaciente abaAtiva="inicio" />

      {clinicaInfoAberta && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {clinicaInfoAberta.emoji} {clinicaInfoAberta.nome}
            </h3>
            <p className="text-sm text-blue-500 font-medium mb-4">
              {clinicaInfoAberta.bairro}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Endereço:</span> {clinicaInfoAberta.endereco}
              </p>
              <p>
                <span className="font-semibold">Telefone:</span> {clinicaInfoAberta.telefone}
              </p>
              <p>
                <span className="font-semibold">Funcionamento:</span> {clinicaInfoAberta.horario}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setClinicaInfoAberta(null)}
              className="w-full mt-5 bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Espaço extra para não sobrepor o conteúdo com a nav bar */}
      <div className="h-24" />
    </div>
  );
}

export default HomePaciente;
