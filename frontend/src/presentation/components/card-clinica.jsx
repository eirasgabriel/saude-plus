
// COMPONENTE: Card de Clínica — Saúde+
// Exibido na Home do Paciente para cada unidade de saúde
// Layout otimizado para mobile (toque fácil, leitura clara)


import React from "react";

/**
 * Card visual de uma clínica de saúde
 *
 * @param {string}   nome         - Nome da clínica
 * @param {string}   bairro       - Bairro/localidade (ex: Bacaxá, Itaúna)
 * @param {string}   endereco     - Endereço completo
 * @param {string}   telefone     - Telefone de contato
 * @param {string[]} especialidades - Lista de especialidades disponíveis
 * @param {boolean}  aberta        - Se a clínica está em funcionamento
 * @param {function} aoAgendar    - Função chamada ao clicar em "Agendar"
 */
function CardClinica({
  nome,
  bairro,
  endereco,
  telefone,
  especialidades = [],
  aberta = true,
  aoAgendar,
}) {
  return (
    // Container do card — sombra suave, bordas arredondadas, fácil de tocar
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-md sm:p-5">
      
      {/* Cabeçalho: nome da clínica + indicador de funcionamento */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-800">{nome}</h2>
          {/* Bairro em destaque — referência regional para o paciente */}
          <span className="text-blue-400 font-medium text-sm">{bairro}</span>
        </div>

        {/* Badge de status: Aberta / Fechada */}
        <span
          className={`
            self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto
            ${aberta
              ? "bg-green-100 text-green-700"   // Verde quando aberta
              : "bg-red-100 text-red-500"        // Vermelho quando fechada
            }
          `}
        >
          {aberta ? "Aberta" : "Fechada"}
        </span>
      </div>

      {/* Endereço — ícone de localização */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-gray-400 text-sm mt-0.5">Localização</span>
        <p className="min-w-0 break-words text-sm text-gray-600">{endereco}</p>
      </div>

      {/* Telefone — clicável no mobile para discagem direta */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-400 text-sm">📞</span>
        <a
          href={`tel:${telefone}`}
          className="text-blue-400 text-sm hover:underline"
        >
          {telefone}
        </a>
      </div>

      {/* Lista de especialidades disponíveis (tags visuais) */}
      {especialidades.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {especialidades.map((esp, indice) => (
            <span
              key={indice}
              className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full"
            >
              {esp}
            </span>
          ))}
        </div>
      )}

      {/* Botão principal — grande para facilitar o toque no celular */}
      <button
        onClick={aoAgendar}
        disabled={!aberta}
        className={`
          w-full py-3 rounded-xl font-semibold text-base transition-all duration-200
          ${aberta
            ? "bg-blue-400 text-white hover:bg-blue-500 active:scale-95"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {aberta ? "Agendar Consulta" : "Indisponível"}
      </button>
    </div>
  );
}

export default CardClinica;
