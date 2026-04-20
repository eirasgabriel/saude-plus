import React from "react";

/**
 * TELA: Médico
 * Mostra agenda 
 */
function HomeMedico() {
  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Agenda do Médico
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-xl font-semibold">
          Consultas de Hoje
        </h2>

        <ul className="mt-4 space-y-2">
          <li>08:00 - João Silva</li>
          <li>10:00 - Ana Costa</li>
          <li>14:00 - Pedro Rocha</li>
        </ul>

      </div>
    </div>
  );
}

export default HomeMedico;