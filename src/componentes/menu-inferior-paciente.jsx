import React from "react";
import { useNavigate } from "react-router-dom";

const ABAS_MENU = [
  { chave: "inicio", label: "Início", icone: "🏠", rota: "/paciente/inicio" },
  { chave: "consultas", label: "Consultas", icone: "📅", rota: "/paciente/consultas" },
  { chave: "historico", label: "Histórico", icone: "📋", rota: "/paciente/historico" },
];

function MenuInferiorPaciente({ abaAtiva }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center shadow-lg z-10">
      {ABAS_MENU.map((aba) => {
        const ativa = abaAtiva === aba.chave;
        return (
          <button
            key={aba.chave}
            type="button"
            onClick={() => navigate(aba.rota)}
            className="flex flex-col items-center gap-1"
            aria-current={ativa ? "page" : undefined}
          >
            <span className="text-2xl">{aba.icone}</span>
            <span className={`${ativa ? "text-blue-400 font-bold" : "text-gray-400"} text-xs`}>
              {aba.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default MenuInferiorPaciente;
