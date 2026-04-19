import React from "react";
import MenuInferiorPaciente from "../componentes/menu-inferior-paciente";
import MenuUsuarioPaciente from "../componentes/menu-usuario-paciente";

function PacienteHistorico() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-white text-2xl font-bold leading-tight">Histórico</h1>
          <MenuUsuarioPaciente />
        </div>
        <p className="text-blue-100 text-sm mt-1">Seus atendimentos anteriores</p>
      </header>

      <main className="px-4 py-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-gray-700 font-semibold mb-1">Nenhum histórico disponível</p>
          <p className="text-gray-500 text-sm">
            Quando suas consultas forem concluídas, elas aparecerão aqui.
          </p>
        </div>
      </main>

      <MenuInferiorPaciente abaAtiva="historico" />
      <div className="h-24" />
    </div>
  );
}

export default PacienteHistorico;
