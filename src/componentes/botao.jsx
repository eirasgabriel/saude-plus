
// COMPONENTE: Botão Reutilizável — Saúde+
// Usado em toda a aplicação com variantes de estilo


import React from "react";

/**
 * Botão padrão do sistema Saúde+
 *
 * @param {string}   variante    - "primario" | "secundario" | "perigo"
 * @param {string}   tamanho     - "pequeno" | "medio" | "grande"
 * @param {boolean}  carregando  - Exibe spinner enquanto processa
 * @param {boolean}  desativado  - Desabilita o botão
 * @param {function} aoClicar    - Função chamada ao clicar
 * @param {node}     children    - Texto ou ícone do botão
 */
function Botao({
  variante = "primario",
  tamanho = "medio",
  carregando = false,
  desativado = false,
  aoClicar,
  children,
  tipo = "button",
  className = "",
}) {
  // Estilos base aplicados em todos os botões
  const estiloBase =
    "font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variantes de cor (identidade visual Saúde+)
  const estiloVariante = {
    primario:
      "bg-blue-400 hover:bg-blue-500 text-white focus:ring-blue-400 active:scale-95",
    secundario:
      "bg-white border-2 border-blue-400 text-blue-400 hover:bg-blue-50 focus:ring-blue-400",
    perigo:
      "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 active:scale-95",
  };

  // Tamanhos — adaptados para toque em mobile
  const estiloTamanho = {
    pequeno: "px-4 py-2 text-sm min-h-[36px]",
    medio: "px-6 py-3 text-base min-h-[48px]",
    grande: "px-8 py-4 text-lg min-h-[56px] w-full", // Botão grande para mobile
  };

  // Estilo quando desativado ou carregando
  const estiloDesativado =
    desativado || carregando ? "opacity-60 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      type={tipo}
      onClick={aoClicar}
      disabled={desativado || carregando}
      className={`
        ${estiloBase}
        ${estiloVariante[variante]}
        ${estiloTamanho[tamanho]}
        ${estiloDesativado}
        ${className}
      `}
    >
      {/* Spinner de carregamento */}
      {carregando && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export default Botao;
