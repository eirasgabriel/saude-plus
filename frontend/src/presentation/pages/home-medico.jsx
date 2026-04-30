import React from "react";

function HomeMedico() {
  return (
    <div className="min-h-svh bg-gray-100">
      <main className="app-content-narrow">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 sm:text-3xl">
          Agenda do Medico
        </h1>

        <div className="rounded-2xl bg-white p-5 shadow sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">
            Consultas de Hoje
          </h2>

          <ul className="mt-4 space-y-2 text-sm text-gray-700 sm:text-base">
            <li>08:00 - Joao Silva</li>
            <li>10:00 - Ana Costa</li>
            <li>14:00 - Pedro Rocha</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default HomeMedico;
