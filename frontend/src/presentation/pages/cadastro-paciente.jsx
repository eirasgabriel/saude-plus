import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { realizarLogin } from "../../application/auth/auth-service";
import { salvarUsuario } from "../../application/usuarios/usuarios-use-cases";
import { buscarEnderecoPorCep } from "../../infrastructure/api/cep-api";
import LogoSaudePlus from "../components/logo-saude-plus";

const FORMULARIO_INICIAL = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  cep: "",
  endereco: "",
  bairro: "",
  cidade: "",
  estado: "",
  senha: "",
  confirmarSenha: "",
};

function somenteNumeros(valor) {
  return valor.replace(/\D/g, "");
}

function formatarCpf(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function formatarCep(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);
  return numeros.replace(/(\d{5})(\d)/, "$1-$2");
}

function validarFormulario(formulario) {
  const cpfNumeros = somenteNumeros(formulario.cpf);
  const telefoneNumeros = somenteNumeros(formulario.telefone);
  const cepNumeros = somenteNumeros(formulario.cep);
  const possuiCampoVazio = Object.values(formulario).some(
    (valor) => !valor.trim()
  );

  if (possuiCampoVazio) return "Preencha todos os campos para criar o cadastro.";
  if (!formulario.nome.trim()) return "Informe seu nome completo.";
  if (!formulario.email.trim()) return "Informe seu email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
    return "Informe um email valido.";
  }
  if (cpfNumeros.length !== 11) return "Informe um CPF com 11 digitos.";
  if (telefoneNumeros.length < 10) return "Informe um telefone com DDD.";
  if (cepNumeros.length !== 8) return "Informe um CEP com 8 digitos.";
  if (formulario.senha.length < 8) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }
  if (formulario.senha !== formulario.confirmarSenha) {
    return "A confirmacao de senha precisa ser igual a senha.";
  }

  return "";
}

function CadastroPaciente() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const estiloInput =
    "mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition shadow-sm";

  function alterarCampo(campo, valor) {
    const normalizadores = {
      cpf: formatarCpf,
      telefone: formatarTelefone,
      cep: formatarCep,
      estado: (v) => v.toUpperCase().slice(0, 2),
    };

    setFormulario((atual) => ({
      ...atual,
      [campo]: normalizadores[campo] ? normalizadores[campo](valor) : valor,
    }));
  }

  async function preencherEnderecoPorCep() {
    const cepNumeros = somenteNumeros(formulario.cep);
    if (cepNumeros.length !== 8) return;

    setBuscandoCep(true);
    setErro("");

    try {
      const endereco = await buscarEnderecoPorCep(cepNumeros);
      setFormulario((atual) => ({
        ...atual,
        cep: formatarCep(endereco.cep),
        endereco: endereco.endereco || atual.endereco,
        bairro: endereco.bairro || atual.bairro,
        cidade: endereco.cidade || atual.cidade,
        estado: endereco.estado || atual.estado,
      }));
    } catch (erroCep) {
      setErro(erroCep.message || "Nao foi possivel consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function aoEnviar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    const mensagemErro = validarFormulario(formulario);
    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setCarregando(true);

    try {
      await salvarUsuario({
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        cpf: somenteNumeros(formulario.cpf),
        telefone: somenteNumeros(formulario.telefone),
        cep: somenteNumeros(formulario.cep),
        endereco: formulario.endereco.trim(),
        bairro: formulario.bairro.trim(),
        cidade: formulario.cidade.trim(),
        estado: formulario.estado.trim().toUpperCase(),
        senha: formulario.senha,
        nivel_acesso: "paciente",
        clinica_id: null,
        status: "ativo",
      });

      await realizarLogin(formulario.email.trim(), formulario.senha);
      setMensagem("Cadastro criado com sucesso. Abrindo sua area de paciente...");
      setTimeout(() => navigate("/paciente/inicio"), 700);
    } catch (erroSalvar) {
      setErro(erroSalvar.message || "Nao foi possivel criar o cadastro.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <section className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 flex-col items-center justify-center p-12 text-white">
        <div className="text-center">
          <LogoSaudePlus className="mx-auto mb-6 shadow-xl" size="xl" />
          <h1 className="text-5xl font-bold mb-3">Saude+</h1>
          <p className="text-blue-100 text-lg mb-10">
            Saude na palma da mao
          </p>
          <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
            Registre-se para acessar sua area de paciente, onde voce podera agendar consultas, acompanhar resultados de exames e muito mais.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {["Cadastro rápido", "Consultas", "Exames", "Vida Saudável"].map(
              (item) => (
                <div
                  key={item}
                  className="bg-white bg-opacity-20 rounded-xl px-4 py-2 text-white text-sm font-medium"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <main className="flex min-h-svh flex-1 items-center justify-center bg-gradient-to-b from-white-400 to-white-500 px-4 py-6 sm:px-6 sm:py-8 lg:min-h-0 lg:bg-gray-50 lg:p-8">
        <div className="w-full max-w-2xl">
          <div className="lg:hidden mb-7 text-center text-white">
            <LogoSaudePlus className="mx-auto mb-4" size="lg" />
            <h1 className="text-3xl font-bold tracking-tight">Saude+</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Saquarema - Secretaria de Saude
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xl sm:rounded-3xl sm:p-8 lg:border lg:border-gray-100 lg:shadow-sm">
            <div className="mb-6">
              <Link
                to="/login"
                className="text-sm font-semibold text-blue-500 hover:text-blue-600"
              >
                Voltar ao login
              </Link>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">
                Criar cadastro
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Use seus dados pessoais para acessar a area do paciente.
              </p>
            </div>

            <form onSubmit={aoEnviar} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Nome</span>
                  <input
                    value={formulario.nome}
                    onChange={(evento) => alterarCampo("nome", evento.target.value)}
                    placeholder="Nome completo"
                    autoComplete="name"
                    className={estiloInput}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Email</span>
                  <input
                    type="email"
                    value={formulario.email}
                    onChange={(evento) => alterarCampo("email", evento.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className={estiloInput}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">CPF</span>
                  <input
                    value={formulario.cpf}
                    onChange={(evento) => alterarCampo("cpf", evento.target.value)}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    autoComplete="off"
                    className={estiloInput}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Telefone</span>
                  <input
                    value={formulario.telefone}
                    onChange={(evento) => alterarCampo("telefone", evento.target.value)}
                    placeholder="(22) 99999-9999"
                    inputMode="tel"
                    autoComplete="tel"
                    className={estiloInput}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">CEP</span>
                  <input
                    value={formulario.cep}
                    onChange={(evento) => alterarCampo("cep", evento.target.value)}
                    onBlur={preencherEnderecoPorCep}
                    placeholder="00000-000"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={estiloInput}
                  />
                  {buscandoCep && (
                    <span className="mt-1 block text-xs font-medium text-blue-500">
                      Buscando endereco...
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Endereco</span>
                  <input
                    value={formulario.endereco}
                    onChange={(evento) => alterarCampo("endereco", evento.target.value)}
                    placeholder="Rua, avenida ou estrada"
                    autoComplete="street-address"
                    className={estiloInput}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Bairro</span>
                  <input
                    value={formulario.bairro}
                    onChange={(evento) => alterarCampo("bairro", evento.target.value)}
                    placeholder="Bairro"
                    autoComplete="address-level3"
                    className={estiloInput}
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_84px]">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">Cidade</span>
                    <input
                      value={formulario.cidade}
                      onChange={(evento) => alterarCampo("cidade", evento.target.value)}
                      placeholder="Cidade"
                      autoComplete="address-level2"
                      className={estiloInput}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700">UF</span>
                    <input
                      value={formulario.estado}
                      onChange={(evento) => alterarCampo("estado", evento.target.value)}
                      placeholder="RJ"
                      autoComplete="address-level1"
                      className={estiloInput}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">Senha</span>
                  <input
                    type="password"
                    value={formulario.senha}
                    onChange={(evento) => alterarCampo("senha", evento.target.value)}
                    placeholder="Minimo de 8 caracteres"
                    autoComplete="new-password"
                    className={estiloInput}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-gray-700">
                    Confirmar senha
                  </span>
                  <input
                    type="password"
                    value={formulario.confirmarSenha}
                    onChange={(evento) =>
                      alterarCampo("confirmarSenha", evento.target.value)
                    }
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    className={estiloInput}
                  />
                </label>
              </div>

              {erro && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {erro}
                </p>
              )}

              {mensagem && (
                <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {mensagem}
                </p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Criando cadastro..." : "Cadastrar-se"}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-xs text-blue-100 lg:text-gray-400">
            Prefeitura Municipal de Saquarema - Sistema Saude+ v1.0
          </p>
        </div>
      </main>
    </div>
  );
}

export default CadastroPaciente;
