import React from "react";
import { ArrowLeft } from "lucide-react";

function juntarClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function CabecalhoApp({
  titulo,
  contexto,
  descricao,
  acao,
  aoVoltar,
  textoVoltar = "Voltar",
  voltarSomenteIcone = false,
  children,
  fixo = true,
  className = "",
  tituloClassName = "",
  descricaoClassName = "",
}) {
  const temTexto = contexto || titulo || descricao;
  const temLinhaVoltar = Boolean(aoVoltar);
  const voltarLateral = aoVoltar && voltarSomenteIcone && temTexto;

  return (
    <header
      className={juntarClasses(
        fixo && "sticky top-0 z-10",
        "bg-blue-400 px-4 shadow-md sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="app-header-inner">
        <div
          className={juntarClasses(
            "flex min-h-[96px] py-4 sm:min-h-[104px]",
            voltarLateral
              ? "items-center gap-3 sm:gap-4"
              : "flex-col justify-center"
          )}
        >
          {aoVoltar && (
            <div
              className={juntarClasses(
                "flex items-start justify-between gap-4",
                voltarLateral ? "shrink-0" : "mb-3"
              )}
            >
              <button
                type="button"
                onClick={aoVoltar}
                aria-label={textoVoltar || "Voltar"}
                className={juntarClasses(
                  "active:opacity-80",
                  voltarSomenteIcone
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                    : "text-sm font-semibold text-white"
                )}
              >
                {voltarSomenteIcone ? (
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                ) : (
                  textoVoltar
                )}
              </button>
              {!voltarLateral && acao}
            </div>
          )}

          {temTexto && (
            <div
              className={juntarClasses(
                voltarLateral && "min-w-0 flex-1",
                ((!aoVoltar && acao) || voltarLateral) &&
                  "flex items-center justify-between gap-4"
              )}
            >
              <div className="min-w-0">
                {contexto && <p className="text-sm text-blue-100">{contexto}</p>}
                {titulo && (
                  <h1
                    className={juntarClasses(
                      "text-2xl font-bold leading-tight text-white sm:text-[1.7rem]",
                      tituloClassName
                    )}
                  >
                    {titulo}
                  </h1>
                )}
                {descricao && (
                  <p
                    className={juntarClasses(
                      "mt-1 text-sm text-blue-100",
                      descricaoClassName
                    )}
                  >
                    {descricao}
                  </p>
                )}
              </div>
              {(!aoVoltar || voltarLateral) && acao}
            </div>
          )}

          {!temTexto && !temLinhaVoltar && acao}
        </div>

        {children && <div className="pb-4">{children}</div>}
      </div>
    </header>
  );
}

export default CabecalhoApp;
