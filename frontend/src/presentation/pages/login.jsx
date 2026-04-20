
// TELA: Login 
// Detecta automaticamente se o usuário está no PC ou Celular
// e adapta o layout para a melhor experiência


import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { realizarLogin } from "../../application/auth/auth-service";

/**
 * Hook personalizado: detecta se o dispositivo é mobile
 * Verifica a largura da tela e o User-Agent do navegador
 * @returns {boolean} true = celular | false = computador
 */
function usarDeteccaoMobile() {
  const [eMobile, setEMobile] = useState(false);

  useEffect(() => {
    // Verifica se a tela tem menos de 768px (padrão mobile)
    const verificarTamanho = () => {
      setEMobile(window.innerWidth < 768);
    };

    // Verificação inicial ao carregar a página
    verificarTamanho();

    // Atualiza ao redimensionar a janela
    window.addEventListener("resize", verificarTamanho);

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener("resize", verificarTamanho);
  }, []);

  return eMobile;
}

/**
 * Tela de Login do Saúde+
 * Layouts distintos para PC (dashboard admin) e Celular (paciente)
 */
function Login() {
  const navigate = useNavigate();
  const eMobile = usarDeteccaoMobile();

  // Estados do formulário
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");          // Mensagem de erro em PT-BR
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  /**
   * Valida os campos antes de enviar
   * @returns {string} Mensagem de erro ou string vazia
   */
  function validarFormulario() {
    if (!email.trim()) return "Por favor, informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "E-mail inválido. Verifique e tente novamente.";
    if (!senha) return "Por favor, informe sua senha.";
    if (senha.length < 6)
      return "A senha deve ter pelo menos 6 caracteres.";
    return "";
  }

  /**
   * Processa o envio do formulário de login
   */


// TRECHO CORRIGIDO DO aoEnviar

async function aoEnviar(e) {
  e.preventDefault();
  setErro("");

  const mensagemErro = validarFormulario();
  if (mensagemErro) {
    setErro(mensagemErro);
    return;
  }

  setCarregando(true);
  try {
    const dados = await realizarLogin(email, senha);
    const nivelAcesso = dados.usuario?.nivel_acesso;

    const rotasPorNivel = {
      paciente: "/paciente/inicio",
      admin_clinica: "/admin/painel",
      admin_master: "/admin/master",
      medico: "/medico/agenda",
    };

    navigate(rotasPorNivel[nivelAcesso] || "/login");

  } catch (err) {
    setErro(err.message || "Erro ao fazer login");
  } finally {
    setCarregando(false);
  }
}



  // LAYOUT MOBILE — Tela cheia, botões grandes, foco no paciente

  if (eMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-500 flex flex-col">
        
        {/* Cabeçalho com identidade visual */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
          
          {/* Ícone e nome do sistema */}
          <div className="mb-10 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">+</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Saúde+</h1>
            <p className="text-blue-100 mt-1 text-sm">Saquarema — Secretaria de Saúde</p>
          </div>

          {/* Cartão do formulário */}
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-7">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Bem-vindo!</h2>
            <p className="text-gray-500 text-sm mb-6">Faça login para agendar sua consulta.</p>

            <form onSubmit={aoEnviar} noValidate>
              
              {/* Campo: E-mail */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              {/* Campo: Senha com botão de visibilidade */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={senhaVisivel ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition pr-12"
                  />
                  {/* Botão para mostrar/ocultar senha */}
                  <button
                    type="button"
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                    aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {senhaVisivel ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {/* Mensagem de erro — exibida em vermelho quando há falha */}
              {erro && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-red-600 text-sm">{erro}</p>
                </div>
              )}

              {/* Botão de login — grande para facilitar toque no celular */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>

              <Link
                to="/cadastro"
                className="mt-3 block w-full text-center border border-blue-200 text-blue-500 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Criar cadastro de paciente
              </Link>

              {/* Link de recuperação de senha */}
              <p className="text-center mt-4 text-sm text-gray-500">
                Esqueceu a senha?{" "}
                <a href="/recuperar-senha" className="text-blue-400 font-medium hover:underline">
                  Clique aqui
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* Rodapé discreto */}
        <p className="text-center text-blue-200 text-xs pb-6">
          Prefeitura Municipal de Saquarema — 2025
        </p>
      </div>
    );
  }


  // LAYOUT DESKTOP — Dois painéis: visual à esquerda, form à direita
  // Voltado para uso administrativo (Prefeitura, Admin Clínica)

  return (
    <div className="min-h-screen flex">
      
      {/* Painel esquerdo — identidade visual e informações do sistema */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 flex-col items-center justify-center p-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-5xl">+</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">Saúde+</h1>
          <p className="text-blue-100 text-lg mb-10">
            Saúde na palma da mão
          </p>
          <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
            Gerenciamento de consultas para as unidades de saúde do município de Saquarema.
          </p>

          {/* Lista de unidades disponíveis */}
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {["Bacaxá", "Itaúna", "Vilatur", "Sampaio Corrêa"].map((bairro) => (
              <div
                key={bairro}
                className="bg-white bg-opacity-20 rounded-xl px-4 py-2 text-white text-sm font-medium"
              >
                📍 {bairro}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito — formulário de login */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          
          {/* Logo em telas menores (não tem o painel esquerdo) */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-4xl">+</span>
            <h1 className="text-2xl font-bold text-blue-400 mt-2">Saúde+</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Acesso ao Sistema</h2>
          <p className="text-gray-500 mb-8">
            Área administrativa - Prefeitura de Saquarema
          </p>

          <form onSubmit={aoEnviar} noValidate>
            
            {/* Campo: E-mail */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@saquarema.rj.gov.br"
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition shadow-sm"
              />
            </div>

            {/* Campo: Senha */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={senhaVisivel ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha de acesso"
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition shadow-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setSenhaVisivel(!senhaVisivel)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {senhaVisivel ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {/* Mensagem de erro — visível apenas quando há problema */}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <p className="text-red-600 text-sm">{erro}</p>
              </div>
            )}

            {/* Botão de login */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-base transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {carregando ? "Verificando acesso..." : "Entrar"}
            </button>

            <Link
              to="/cadastro"
              className="mt-4 block w-full text-center border border-blue-200 text-blue-500 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Cadastre-se
            </Link>
          </form>

          {/* Rodapé desktop */}
          <p className="text-center mt-8 text-xs text-gray-400">
            Prefeitura Municipal de Saquarema — Sistema Saúde+ v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
