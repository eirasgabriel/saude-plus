import React, { useEffect, useState } from "react";
import {
  obterUsuarioAtual,
  registrarUsuarioAutenticado,
} from "../../application/auth/auth-service";
import { salvarUsuario } from "../../application/usuarios/usuarios-use-cases";
import { buscarEnderecoPorCep } from "../../infrastructure/api/cep-api";
import CabecalhoApp from "../components/cabecalho-app";
import MenuInferiorPaciente from "../components/menu-inferior-paciente";
import MenuUsuarioPaciente from "../components/menu-usuario-paciente";

const CAMPOS_PERFIL = [
  { chave: "nome", rotulo: "Nome", autoComplete: "name" },
  { chave: "email", rotulo: "E-mail", tipo: "email", autoComplete: "email" },
  { chave: "cpf", rotulo: "CPF", inputMode: "numeric" },
  { chave: "telefone", rotulo: "Telefone", inputMode: "tel", autoComplete: "tel" },
  { chave: "cep", rotulo: "CEP", inputMode: "numeric", autoComplete: "postal-code" },
  { chave: "endereco", rotulo: "Endereço", autoComplete: "street-address" },
  { chave: "bairro", rotulo: "Bairro", autoComplete: "address-level3" },
  { chave: "cidade", rotulo: "Cidade", autoComplete: "address-level2" },
  { chave: "estado", rotulo: "UF", autoComplete: "address-level1" },
];

function somenteNumeros(valor) {
  return String(valor || "").replace(/\D/g, "");
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

function montarFormulario(usuario) {
  return {
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    cpf: formatarCpf(usuario?.cpf || ""),
    telefone: formatarTelefone(usuario?.telefone || ""),
    cep: formatarCep(usuario?.cep || ""),
    endereco: usuario?.endereco || "",
    bairro: usuario?.bairro || "",
    cidade: usuario?.cidade || "",
    estado: String(usuario?.estado || "").toUpperCase().slice(0, 2),
  };
}

function validarFormulario(formulario) {
  const cpfNumeros = somenteNumeros(formulario.cpf);
  const telefoneNumeros = somenteNumeros(formulario.telefone);
  const cepNumeros = somenteNumeros(formulario.cep);

  if (!formulario.nome.trim()) return "Digite seu nome completo.";
  if (!formulario.email.trim()) return "Digite seu e-mail.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
    return "Digite um e-mail válido.";
  }
  if (cpfNumeros.length !== 11) return "Digite um CPF com 11 dígitos.";
  if (telefoneNumeros.length < 10) return "Digite um telefone com DDD.";
  if (cepNumeros.length !== 8) return "Digite um CEP com 8 dígitos.";
  if (!formulario.endereco.trim()) return "Digite seu endereço.";
  if (!formulario.bairro.trim()) return "Digite seu bairro.";
  if (!formulario.cidade.trim()) return "Digite sua cidade.";
  if (formulario.estado.trim().length !== 2) return "Digite a UF com 2 letras.";

  return "";
}

function PacientePerfil() {
  const [usuario, setUsuario] = useState(() => obterUsuarioAtual());
  const [formulario, setFormulario] = useState(() => montarFormulario(usuario));
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    setFormulario(montarFormulario(usuario));
  }, [usuario]);

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

  function iniciarEdicao() {
    setErro("");
    setMensagem("");
    setFormulario(montarFormulario(usuario));
    setEditando(true);
  }

  function cancelarEdicao() {
    setErro("");
    setMensagem("");
    setFormulario(montarFormulario(usuario));
    setEditando(false);
  }

  async function preencherEnderecoPorCep() {
    const cepNumeros = somenteNumeros(formulario.cep);
    if (!editando || cepNumeros.length !== 8) return;

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
      setErro(erroCep.message || "Não conseguimos buscar esse CEP agora. Você pode preencher o endereço manualmente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function salvarPerfil(evento) {
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
      const dadosAtualizados = await salvarUsuario({
        ...usuario,
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        cpf: somenteNumeros(formulario.cpf),
        telefone: somenteNumeros(formulario.telefone),
        cep: somenteNumeros(formulario.cep),
        endereco: formulario.endereco.trim(),
        bairro: formulario.bairro.trim(),
        cidade: formulario.cidade.trim(),
        estado: formulario.estado.trim().toUpperCase(),
      });
      const usuarioAtualizado = { ...usuario, ...dadosAtualizados };

      registrarUsuarioAutenticado(usuarioAtualizado);
      setUsuario(usuarioAtualizado);
      setEditando(false);
      setMensagem("Dados atualizados com sucesso.");
    } catch (erroSalvar) {
      setErro(erroSalvar.message || "Não conseguimos atualizar seus dados agora.");
    } finally {
      setCarregando(false);
    }
  }

  const estiloInput =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm transition hover:border-blue-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50";

  return (
    <div className="min-h-screen bg-gray-50">
      <CabecalhoApp
        titulo="Meu perfil"
        descricao="Dados da sua conta"
        acao={<MenuUsuarioPaciente mostrarPerfil={false} />}
      />

      <main className="app-content-narrow space-y-4">
        <form
          onSubmit={salvarPerfil}
          className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Dados pessoais</h2>
              <p className="text-sm text-gray-500">
                Informações usadas no seu cadastro de paciente.
              </p>
            </div>
            {!editando && (
              <button
                type="button"
                onClick={iniciarEdicao}
                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
              >
                Editar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CAMPOS_PERFIL.map((campo) => (
              <label
                key={campo.chave}
                className={campo.chave === "endereco" ? "block sm:col-span-2" : "block"}
              >
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  {campo.rotulo}
                </span>
                <input
                  type={campo.tipo || "text"}
                  value={formulario[campo.chave]}
                  onChange={(evento) => alterarCampo(campo.chave, evento.target.value)}
                  onBlur={campo.chave === "cep" ? preencherEnderecoPorCep : undefined}
                  disabled={!editando || carregando}
                  inputMode={campo.inputMode}
                  autoComplete={campo.autoComplete}
                  className={estiloInput}
                />
              </label>
            ))}
          </div>

          {buscandoCep && (
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600">
              Buscando endereço...
            </p>
          )}

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

          {editando && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={carregando}
                className="flex-1 rounded-xl bg-blue-400 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                type="button"
                onClick={cancelarEdicao}
                disabled={carregando}
                className="rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>

      </main>

      <MenuInferiorPaciente abaAtiva="perfil" />
      <div className="h-24" />
    </div>
  );
}

export default PacientePerfil;
