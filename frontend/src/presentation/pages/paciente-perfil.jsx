import React from "react";
import { obterUsuarioAtual } from "../../application/auth/auth-service";
import MenuInferiorPaciente from "../components/menu-inferior-paciente";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

function PacientePerfil() {
  const usuario = obterUsuarioAtual();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-white text-2xl font-bold leading-tight">Meu perfil</h1>
          <MenuUsuarioPaciente mostrarPerfil={false} />
        </div>
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
        </div>
      </main>

      <MenuInferiorPaciente abaAtiva="perfil" />
      <div className="h-24" />
    </div>
  );
}

export default PacientePerfil;
