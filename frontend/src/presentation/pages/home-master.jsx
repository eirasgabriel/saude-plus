import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RELATORIO_VAZIO,
  obterRelatoriosSistema,
} from "../../application/sistema/relatorios-use-cases";
import { realizarLogout } from "../../application/auth/auth-service";

const CARTOES_ADMIN = [
  {
    titulo: "Clinicas",
    descricao: "Gerenciar unidades de saude",
    rota: "/admin/master/clinicas",
    detalhe: "Cadastro, status e capacidade",
  },
  {
    titulo: "Usuarios",
    descricao: "Gerenciar acessos",
    rota: "/admin/master/usuarios",
    detalhe: "Perfis, bloqueios e vinculos",
  },
  {
    titulo: "Relatorios",
    descricao: "Visualizar dados gerais",
    rota: "/admin/master/relatorios",
    detalhe: "Consultas, ocupacao e resultados",
  },
];

function HomeMaster() {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState(RELATORIO_VAZIO.resumo);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);

  useEffect(() => {
    async function carregarResumo() {
      try {
        const relatorio = await obterRelatoriosSistema();
        setResumo(relatorio.resumo);
      } catch {
        setResumo(RELATORIO_VAZIO.resumo);
      }
    }

    carregarResumo();
  }, []);

  function sairDaConta() {
    setMenuUsuarioAberto(false);
    realizarLogout();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-400 px-5 pt-12 pb-6 sticky top-0 z-10 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">Admin Master</p>
            <h1 className="text-white text-2xl font-bold leading-tight">
              Painel Admin Master
            </h1>
          </div>
          <div className="relative z-30">
            <button
              type="button"
              onClick={() => setMenuUsuarioAberto((v) => !v)}
              className="w-11 h-11 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl"
              aria-label="Perfil do usuário"
            >
              👤
            </button>
            {menuUsuarioAberto && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40">
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
        </div>
        <p className="text-blue-100 text-sm mt-2">
          Gerenciamento central das clinicas, usuarios e indicadores do Saude+.
        </p>
      </header>

      <main className="px-4 py-5 space-y-5">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Clinicas ativas</p>
            <strong className="text-3xl text-gray-800">{resumo.clinicasAtivas}</strong>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Usuarios ativos</p>
            <strong className="text-3xl text-gray-800">{resumo.usuariosAtivos}</strong>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Consultas no mes</p>
            <strong className="text-3xl text-gray-800">{resumo.consultasMes}</strong>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Cancelamentos</p>
            <strong className="text-3xl text-gray-800">{resumo.taxaCancelamento}%</strong>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CARTOES_ADMIN.map((cartao) => (
            <button
              key={cartao.rota}
              type="button"
              onClick={() => navigate(cartao.rota)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-md transition"
            >
              <p className="text-blue-500 text-sm font-semibold">{cartao.detalhe}</p>
              <h2 className="text-xl font-semibold text-gray-800 mt-2">{cartao.titulo}</h2>
              <p className="text-gray-500 mt-2">{cartao.descricao}</p>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

export default HomeMaster;
