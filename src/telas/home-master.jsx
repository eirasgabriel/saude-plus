import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * COMPONENTE: HomeMaster
 * tela principal do ADMIN MASTER 
 * gerenciar clínicas, usuários e relatórios
 * 
 */
function HomeMaster() { 
    
    //troca de página 
    const navigate = useNavigate();

    return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <p className="text-blue-100 text-sm">Admin Master</p>
        <h1 className="text-white text-2xl font-bold leading-tight">
          Painel Admin Master
        </h1>
        <p className="text-blue-100 text-sm mt-2">
          Seja bem vindo ao Sistema de Gerenciamento de Clínicas
        </p>
      </header>

      {/* GRID DE CARDS */}
      {/* grid = ativa layout em grade */}
      {/* grid-cols-1 = 1 coluna no celular */}
      {/* md:grid-cols-3 = 3 colunas no desktop */}
      {/* gap-6 = espaço entre os blocos */}
      <main className="px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/*layout responsivo. no celular fica 1 coluna, no desktop 3 colunas automaticamente/*

        {/* CARD 1 - CLÍNICAS */}
        <div
            onClick={()=> navigate("/admin/master/clinicas")} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:scale-105 transition">

          {/* Título do card */}
          <h2 className="text-xl font-semibold">Clínicas</h2>

          {/* Descrição */}
          <p className="text-gray-500 mt-2">Gerenciar unidades de saúde</p>
        </div>

        {/* CARD 2 - USUÁRIOS */}
        <div
            onClick={() => navigate("/admin/master/usuarios")}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:scale-105 transition">

          <h2 className="text-xl font-semibold">Usuários</h2>

          <p className="text-gray-500 mt-2">Gerenciar acessos</p>
        </div>

        {/* CARD 3 - RELATÓRIOS */}
        <div
            onClick={() => navigate("/admin/master/relatorios")}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:scale-105 transition">

          <h2 className="text-xl font-semibold">Relatórios</h2>

          <p className="text-gray-500 mt-2">Visualizar dados gerais do sistema</p>
        </div>

      </div>
      </main>
    </div>
  );
}

// Exporta o componente pra ser usado nas rotas
export default HomeMaster;