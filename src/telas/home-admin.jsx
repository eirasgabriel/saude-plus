import React from "react";

/**
 * TELA: Admin Clínica
 * painel da clínica
 */
function HomeAdmin() {
  return (

    // Container principal
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Título */}
      <h1 className="text-3xl font-bold mb-6">Painel da Clínica</h1>

      {/* Cards */}
      <div className="grid gap-6">

        {/* CARD: Consultas */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Consultas do Dia</h2>

          <p className="text-gray-500 mt-2">Visualização das consultas agendadas</p>

          {/* Lista simulada */}
          <ul className="mt-4 space-y-2">
            <li>08:00 - João Silva</li>
            <li>09:30 - Maria Souza</li>
            <li>11:00 - Carlos Lima</li>
          </ul>
        </div>

        {/* CARD: Criar Agenda */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Criar Agenda
          </h2>

          <p className="text-gray-500 mt-2">
            Definir horários disponíveis
          </p>

          {/* Botão fake */}
          <button className="mt-4 bg-blue-400 text-white px-4 py-2 rounded">
            Criar Horários
          </button>
        </div>

      </div>
    </div>
  );
}

export default HomeAdmin;