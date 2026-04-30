import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { realizarLogin } from "../../application/auth/auth-service";
import { usarDispositivo } from "../../infrastructure/device/use-dispositivo";
import LogoSaudePlus from "../components/logo-saude-plus";

function Login() {
  const navigate = useNavigate();
  const dispositivo = usarDispositivo();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  function validarFormulario() {
    if (!email.trim()) return "Por favor, informe seu e-mail.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "E-mail invalido. Verifique e tente novamente.";
    }
    if (!senha) return "Por favor, informe sua senha.";
    if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    return "";
  }

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

  const formulario = (
    <form onSubmit={aoEnviar} noValidate>
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={
            dispositivo.celular ? "seu@email.com" : "usuario@saquarema.rj.gov.br"
          }
          autoComplete="email"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Senha
        </label>
        <div className="relative">
          <input
            type={senhaVisivel ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-14 text-base text-gray-800 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="button"
            onClick={() => setSenhaVisivel((atual) => !atual)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
          >
            {senhaVisivel ? "Ocultar" : "Ver"}
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{erro}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-xl bg-blue-400 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-blue-500 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando ? "Entrando..." : "Entrar"}
      </button>

      <Link
        to="/cadastro"
        className="mt-4 block w-full rounded-xl border border-blue-200 py-3 text-center font-bold text-blue-500 transition hover:bg-blue-50"
      >
        {dispositivo.celular ? "Criar cadastro de paciente" : "Cadastre-se"}
      </Link>

      {dispositivo.celular && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Esqueceu a senha?{" "}
          <a href="/recuperar-senha" className="font-medium text-blue-400 hover:underline">
            Clique aqui
          </a>
        </p>
      )}
    </form>
  );

  if (dispositivo.celular) {
    return (
      <div className="flex min-h-svh flex-col bg-gradient-to-b from-blue-400 to-blue-500">
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-12">
          <div className="mb-10 text-center">
            <LogoSaudePlus className="mx-auto mb-4" size="lg" />
            <h1 className="text-3xl font-bold tracking-tight text-white">Saude+</h1>
            <p className="mt-1 text-sm text-blue-100">
              Saquarema - Secretaria de Saude
            </p>
          </div>

          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="mb-1 text-xl font-bold text-gray-800">Bem-vindo!</h2>
            <p className="mb-6 text-sm text-gray-500">
              Faca login para agendar sua consulta.
            </p>
            {formulario}
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-blue-200">
          Prefeitura Municipal de Saquarema - 2025
        </p>
      </div>
    );
  }

  if (dispositivo.tablet) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-blue-400 to-blue-500 p-6">
        <div className="grid w-full max-w-5xl grid-cols-[0.9fr_1.1fr] overflow-hidden rounded-3xl bg-white shadow-2xl">
          <section className="flex flex-col justify-center bg-blue-500 p-10 text-white">
            <LogoSaudePlus className="mb-6" size="lg" />
            <h1 className="text-4xl font-bold">Saude+</h1>
            <p className="mt-3 max-w-sm text-blue-100">
              Interface otimizada para tablets, com leitura ampla e toque confortavel.
            </p>
          </section>

          <section className="flex items-center justify-center p-10">
            <div className="w-full max-w-md">
              <h2 className="mb-2 text-3xl font-bold text-gray-800">
                Acesso ao Sistema
              </h2>
              <p className="mb-8 text-gray-500">
                Area administrativa - Prefeitura de Saquarema
              </p>
              {formulario}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh">
      <section className="flex w-1/2 flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 p-12">
        <div className="text-center">
          <LogoSaudePlus className="mx-auto mb-6 shadow-xl" size="xl" />
          <h1 className="mb-3 text-5xl font-bold text-white">Saude+</h1>
          <p className="mb-10 text-lg text-blue-100">Saude na palma da mao</p>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-blue-200">
            Gerenciamento de consultas para as unidades de saude do municipio de
            Saquarema.
          </p>

          <div className="mx-auto mt-10 grid max-w-xs grid-cols-2 gap-3">
            {["Bacaxa", "Itauna", "Vilatur", "Sampaio Correa"].map((bairro) => (
              <div
                key={bairro}
                className="rounded-xl bg-white bg-opacity-20 px-4 py-2 text-sm font-medium text-white"
              >
                {bairro}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <h2 className="mb-2 text-3xl font-bold text-gray-800">
            Acesso ao Sistema
          </h2>
          <p className="mb-8 text-gray-500">
            Area administrativa - Prefeitura de Saquarema
          </p>
          {formulario}
          <p className="mt-8 text-center text-xs text-gray-400">
            Prefeitura Municipal de Saquarema - Sistema Saude+ v1.0
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;
