
// TELA: Home do Paciente 
// Lista as clínicas disponíveis em Saquarema
// Layout 100% mobile-friendly: botões grandes, leitura fácil


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CLINICAS_SAQUAREMA } from "../dados/clinicas-mock";

/**
 * Tela principal do Paciente
 * Mostra saudação, barra de busca e lista de clínicas
 */
function HomePaciente() {
  const navigate = useNavigate();

  // Simula o nome do usuário logado (virá do contexto de autenticação)
  const nomeUsuario = "Maria";

  // Estado da busca por clínica
  const [termoBusca, setTermoBusca] = useState("");

  // Estado das clínicas filtradas
  const [clinicasFiltradas, setClinicasFiltradas] = useState(CLINICAS_SAQUAREMA);

  // Estado do filtro de especialidade selecionada
  const [especialidadeSelecionada, setEspecialidadeSelecionada] = useState("Todas");

  // Estado de carregamento (para simular busca na API futuramente)
  const [carregando, setCarregando] = useState(false);

  // Lista única de todas as especialidades disponíveis
  const todasEspecialidades = [
    "Todas",
    ...new Set(CLINICAS_SAQUAREMA.flatMap((c) => c.especialidades)),
  ];

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

      return bateTexto && bateEspecialidade;
    });

    setClinicasFiltradas(resultado);
  }, [termoBusca, especialidadeSelecionada]);

  /**
   * Navega para a tela de agendamento da clínica selecionada
   * @param {object} clinica - Dados da clínica escolhida
   */
  function aoClicarAgendar(clinica) {
    navigate(`/paciente/agendar?clinica=${clinica.id}`);
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
          <button
            className="w-11 h-11 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl"
            aria-label="Perfil do usuário"
          >
            👤
          </button>
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
            className="w-full bg-white rounded-2xl pl-11 pr-4 py-3.5 text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
          />
          {/* Botão de limpar busca */}
          {termoBusca && (
            <button
              onClick={() => setTermoBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
              aria-label="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      {/* ---- CONTEÚDO PRINCIPAL ---- */}
      <main className="px-4 py-5">

        {/* Filtro por especialidade — horizontal scrollável */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
            Especialidades
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {todasEspecialidades.map((esp) => (
              <button
                key={esp}
                onClick={() => setEspecialidadeSelecionada(esp)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${especialidadeSelecionada === esp
                    ? "bg-blue-400 text-white shadow-md"    // Filtro ativo
                    : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                {esp}
              </button>
            ))}
          </div>
        </div>

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
              Tente outro nome ou especialidade
            </p>
            <button
              onClick={() => {
                setTermoBusca("");
                setEspecialidadeSelecionada("Todas");
              }}
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

                  {/* Botão principal de agendamento */}
                  <button
                    onClick={() => aoClicarAgendar(clinica)}
                    disabled={!clinica.aberta}
                    className={`flex-[2] font-bold py-3 rounded-xl text-base transition-all duration-200 active:scale-95 ${
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

      {/* ---- NAVEGAÇÃO INFERIOR (Bottom Tab Bar) ---- */}
      {/* Padrão mobile: ícones grandes, fácil de alcançar com o polegar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center shadow-lg z-10">
        
        {/* Aba: Início (ativa) */}
        <button className="flex flex-col items-center gap-1">
          <span className="text-2xl">🏠</span>
          <span className="text-blue-400 text-xs font-bold">Início</span>
        </button>

        {/* Aba: Minhas Consultas */}
        <button className="flex flex-col items-center gap-1">
          <span className="text-2xl">📅</span>
          <span className="text-gray-400 text-xs">Consultas</span>
        </button>

        {/* Aba: Histórico */}
        <button className="flex flex-col items-center gap-1">
          <span className="text-2xl">📋</span>
          <span className="text-gray-400 text-xs">Histórico</span>
        </button>

        {/* Aba: Perfil */}
        <button className="flex flex-col items-center gap-1">
          <span className="text-2xl">👤</span>
          <span className="text-gray-400 text-xs">Perfil</span>
        </button>
      </nav>

      {/* Espaço extra para não sobrepor o conteúdo com a nav bar */}
      <div className="h-24" />
    </div>
  );
}

export default HomePaciente;
