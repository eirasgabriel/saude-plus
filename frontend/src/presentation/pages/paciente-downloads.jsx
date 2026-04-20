import React from "react";
import MenuInferiorPaciente from "../components/menu-inferior-paciente";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

const DOCUMENTOS = [
  {
    id: 1,
    titulo: "Comprovantes de consultas",
    descricao: "Baixe comprovantes dos agendamentos realizados.",
  },
  {
    id: 2,
    titulo: "Resultados de exames",
    descricao: "Acesse arquivos liberados pelas unidades de saude.",
  },
  {
    id: 3,
    titulo: "Declaracoes",
    descricao: "Documentos emitidos para atendimentos e comparecimento.",
  },
];

function PacienteDownloads() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-blue-400 px-5 pb-6 pt-12 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight text-white">Downloads</h1>
          <MenuUsuarioPaciente />
        </div>
        <p className="mt-1 text-sm text-blue-100">
          Documentos e arquivos do paciente
        </p>
      </header>

      <main className="space-y-3 px-4 py-5">
        {DOCUMENTOS.map((documento) => (
          <div
            key={documento.id}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-800">{documento.titulo}</p>
                <p className="mt-1 text-sm text-gray-500">{documento.descricao}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                Em breve
              </span>
            </div>
            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-400"
            >
              Nenhum arquivo disponivel
            </button>
          </div>
        ))}
      </main>

      <MenuInferiorPaciente abaAtiva="downloads" />
      <div className="h-24" />
    </div>
  );
}

export default PacienteDownloads;
