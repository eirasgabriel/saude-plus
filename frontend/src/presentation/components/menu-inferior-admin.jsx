import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ABAS_MENU = [
  { chave: "inicio", label: "Inicio", rota: "/admin/painel" },
  { chave: "consultas", label: "Consultas", rota: "/admin/painel/consultas" },
  { chave: "exames", label: "Exames", rota: "/admin/painel/exames" },
];

function MenuInferiorAdmin({ abaAtiva }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-gray-100 bg-white px-3 py-2 shadow-lg">
      {ABAS_MENU.map((aba) => {
        const ativa = abaAtiva ? abaAtiva === aba.chave : location.pathname === aba.rota;
        return (
          <button
            key={aba.chave}
            type="button"
            onClick={() => navigate(aba.rota)}
            className={`min-w-0 rounded-lg px-2 py-2 text-xs font-semibold transition ${
              ativa
                ? "bg-blue-50 text-blue-500"
                : "text-gray-400 hover:bg-gray-50 hover:text-blue-500"
            }`}
            aria-current={ativa ? "page" : undefined}
          >
            <span className="block truncate">{aba.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default MenuInferiorAdmin;
