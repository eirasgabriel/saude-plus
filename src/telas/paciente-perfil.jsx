import React from "react";
import { obterUsuarioAtual, realizarLogout } from "../logica-de-controle/auth";
import MenuInferiorPaciente from "../componentes/menu-inferior-paciente";

function PacientePerfil() {
  const usuario = obterUsuarioAtual();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <h1 className="text-white text-2xl font-bold leading-tight">Meu perfil</h1>
        <p className="text-blue-100 text-sm mt-1">Dados da sua conta</p>
      </header>

      <main className="px-4 py-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Nome</p>
            <p className="text-gray-800 font-semibold">{usuario?.nome || "Paciente"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">E-mail</p>
            <p className="text-gray-700">{usuario?.email || "Não informado"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Nível de acesso</p>
            <p className="text-gray-700">{usuario?.nivel_acesso || "paciente"}</p>
          </div>
          <button
            type="button"
            onClick={realizarLogout}
            className="w-full mt-2 bg-red-50 border border-red-200 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition"
          >
            Sair da conta
          </button>
        </div>
      </main>

      <MenuInferiorPaciente abaAtiva="perfil" />
      <div className="h-24" />
    </div>
  );
}

export default PacientePerfil;
