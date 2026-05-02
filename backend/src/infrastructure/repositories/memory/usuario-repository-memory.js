const fs = require("fs");
const path = require("path");
const { usuariosSeed } = require("./seeds");
const { gerarHashSenha, pareceHashSenha } = require("../../security/passwords");

const CAMINHO_PADRAO_DADOS = path.resolve(__dirname, "../../../../data/usuarios.json");

function copiarUsuario(usuario) {
  return JSON.parse(JSON.stringify(usuario));
}

function removerSenha(usuario) {
  const { senha: _senha, senha_hash: _senhaHash, ...usuarioSeguro } = usuario;
  return copiarUsuario(usuarioSeguro);
}

function normalizarRegistroUsuario(usuario) {
  const proximo = copiarUsuario(usuario);

  if (!proximo.senha_hash) {
    proximo.senha_hash = pareceHashSenha(proximo.senha)
      ? proximo.senha
      : gerarHashSenha(proximo.senha || "ChangeMe123!");
  }

  delete proximo.senha;
  return proximo;
}

function carregarRegistros(usuarios, caminhoDados) {
  if (!fs.existsSync(caminhoDados)) {
      return usuarios.map(normalizarRegistroUsuario);
  }

  try {
    const conteudo = fs.readFileSync(caminhoDados, "utf8");
    const dados = JSON.parse(conteudo);

    if (Array.isArray(dados)) {
      return dados.map(normalizarRegistroUsuario);
    }

    console.warn(`Arquivo de usuarios ignorado: formato invalido em ${caminhoDados}`);
  } catch (erro) {
    console.warn(`Nao foi possivel carregar usuarios persistidos em ${caminhoDados}:`, erro.message);
  }

  return usuarios.map(normalizarRegistroUsuario);
}

async function persistirRegistros(caminhoDados, registros) {
  await fs.promises.mkdir(path.dirname(caminhoDados), { recursive: true });

  const temporario = `${caminhoDados}.tmp`;
  const conteudo = `${JSON.stringify(registros, null, 2)}\n`;

  await fs.promises.writeFile(temporario, conteudo, "utf8");
  await fs.promises.rm(caminhoDados, { force: true });
  await fs.promises.rename(temporario, caminhoDados);
}

function criarUsuarioRepositoryMemory(usuarios = usuariosSeed, opcoes = {}) {
  const caminhoDados = opcoes.caminhoDados || CAMINHO_PADRAO_DADOS;
  const registros = carregarRegistros(usuarios, caminhoDados);

  return {
    async buscarPorEmail(email) {
      const emailNormalizado = String(email || "").toLowerCase();
      const usuario = registros.find(
        (item) => String(item.email || "").toLowerCase() === emailNormalizado
      );
      return usuario ? copiarUsuario(usuario) : null;
    },

    async buscarPorId(id) {
      const usuario = registros.find((item) => Number(item.id) === Number(id));
      return usuario ? copiarUsuario(usuario) : null;
    },

    async listar() {
      return registros.map(removerSenha);
    },

    async salvar(dados) {
      const novoUsuario = {
        id: Math.max(...registros.map((usuario) => Number(usuario.id)), 0) + 1,
        senha_hash: gerarHashSenha(dados.senha),
        ultimo_acesso: "Ainda nao acessou",
        criado_em: new Date().toISOString().slice(0, 10),
        ...dados,
      };
      delete novoUsuario.senha;

      registros.unshift(novoUsuario);
      await persistirRegistros(caminhoDados, registros);
      return removerSenha(novoUsuario);
    },

    async atualizar(id, dados) {
      const index = registros.findIndex((usuario) => Number(usuario.id) === Number(id));
      if (index < 0) return null;

      const payload = { ...dados };
      if (payload.senha) {
        payload.senha_hash = gerarHashSenha(payload.senha);
        delete payload.senha;
      }

      registros[index] = {
        ...registros[index],
        ...payload,
        id: registros[index].id,
      };

      await persistirRegistros(caminhoDados, registros);
      return removerSenha(registros[index]);
    },
  };
}

module.exports = { criarUsuarioRepositoryMemory };
