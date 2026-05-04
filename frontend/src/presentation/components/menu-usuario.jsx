import React, { useEffect, useRef, useState } from "react";
import { LogOut, UserCircle, UserRound } from "lucide-react";
import { realizarLogout } from "../../application/auth/auth-service";

function juntarClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function MenuUsuario({
  mostrarPerfil = false,
  aoPerfil,
  aoSair = realizarLogout,
  className = "",
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const tempoFechamentoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (tempoFechamentoRef.current) {
        clearTimeout(tempoFechamentoRef.current);
      }
    };
  }, []);

  function fecharMenuAoSairDoHover() {
    cancelarFechamentoDoMenu();
    tempoFechamentoRef.current = setTimeout(() => {
      setMenuAberto(false);
    }, 350);
  }

  function cancelarFechamentoDoMenu() {
    if (tempoFechamentoRef.current) {
      clearTimeout(tempoFechamentoRef.current);
      tempoFechamentoRef.current = null;
    }
  }

  function abrirOuFecharMenu() {
    cancelarFechamentoDoMenu();
    setMenuAberto((valorAtual) => !valorAtual);
  }

  function irParaPerfil() {
    setMenuAberto(false);
    if (aoPerfil) aoPerfil();
  }

  function sairDaConta() {
    setMenuAberto(false);
    aoSair();
  }

  return (
    <div
      className={juntarClasses("relative z-30", className)}
      onMouseEnter={cancelarFechamentoDoMenu}
      onMouseLeave={fecharMenuAoSairDoHover}
    >
      <button
        type="button"
        onClick={abrirOuFecharMenu}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        aria-label="Perfil do usuário"
      >
        <UserCircle className="h-6 w-6" aria-hidden="true" />
      </button>

      {menuAberto && (
        <div className="absolute right-0 z-40 mt-4 w-56 overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-xl shadow-blue-950/10 ring-1 ring-black/5 sm:right-1/2 sm:translate-x-1/2">
          <div className="border-b border-gray-100 bg-blue-50/70 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
              Conta
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              Opções do usuário
            </p>
          </div>
          {mostrarPerfil && (
            <button
              type="button"
              onClick={irParaPerfil}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-blue-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Meu perfil</span>
            </button>
          )}
          <button
            type="button"
            onClick={sairDaConta}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MenuUsuario;
