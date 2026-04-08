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
    // Container principal da página / ClassName="bg-white p-6" classes do tailwind CSS - mais efeciente que o css tradiconal, padroniza design automaticamente, já vem responsivo e evita arquivos CSS gigantes
    // min-h-screen = ocupa altura inteira da tela
    // bg-gray-100 = fundo cinza claro
    // p-6 = espaçamento interno
    <div className="min-h-screen bg-gray-100 p-6">

      {/* TÍTULO PRINCIPAL */}
      <h1 className="text-3xl font-bold mb-6">
        Painel Admin Master
      </h1>

      {/* GRID DE CARDS */}
      {/* grid = ativa layout em grade */}
      {/* grid-cols-1 = 1 coluna no celular */}
      {/* md:grid-cols-3 = 3 colunas no desktop */}
      {/* gap-6 = espaço entre os blocos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/*layout responsivo. no celular fica 1 coluna, no desktop 3 colunas automaticamente/*

        {/* CARD 1 - CLÍNICAS */}
        <div
            onClick={()=> navigate("/admin/master/clinicas")} 
            className="bg-white p-6 rounded-xl shadow cursor-point hover:scale-105 transition">

          {/* Título do card */}
          <h2 className="text-xl font-semibold">Clínicas</h2>

          {/* Descrição */}
          <p className="text-gray-500 mt-2">Gerenciar unidades de saúde</p>
        </div>

        {/* CARD 2 - USUÁRIOS */}
        <div
            onClick={() => navigate("/admin/master/usuarios")}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:scale-105 transition">

          <h2 className="text-xl font-semibold">Usuários</h2>

          <p className="text-gray-500 mt-2">Gerenciar acessos</p>
        </div>

        {/* CARD 3 - RELATÓRIOS */}
        <div
            onClick={() => navigate("/admin/master/relatorios")}
            className="bg-white p-6 rounded-xl shadow cursor-pointer hover:scale-105 transition">

          <h2 className="text-xl font-semibold">Relatórios</h2>

          <p className="text-gray-500 mt-2">Visualizar dados gerais do sistema</p>
        </div>

      </div>
    </div>
  );
}

// Exporta o componente pra ser usado nas rotas
export default HomeMaster;