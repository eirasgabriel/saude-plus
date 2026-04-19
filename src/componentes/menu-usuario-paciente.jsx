import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { realizarLogout } from "../logica-de-controle/auth";

function MenuUsuarioPaciente({ mostrarPerfil = true }) {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  function irParaPerfil() {
    setMenuAberto(false);
    navigate("/paciente/perfil");
  }

  function sairDaConta() {
    setMenuAberto(false);
    realizarLogout();
  }

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={() => setMenuAberto((v) => !v)}
        className="w-11 h-11 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl"
        aria-label="Perfil do usuário"
      >
        👤
      </button>
      {menuAberto && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40">
          {mostrarPerfil && (
            <button
              type="button"
              onClick={irParaPerfil}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Meu perfil
            </button>
          )}
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
  );
}

export default MenuUsuarioPaciente;
