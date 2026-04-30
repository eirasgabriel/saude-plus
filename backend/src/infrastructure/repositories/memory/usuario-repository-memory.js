const fs = require("fs");
const path = require("path");
const { usuariosSeed } = require("./seeds");

const CAMINHO_PADRAO_DADOS = path.resolve(__dirname, "../../../../data/usuarios.json");

function copiarUsuario(usuario) {
  return JSON.parse(JSON.stringify(usuario));
}

function removerSenha(usuario) {
  const { senha, ...usuarioSeguro } = usuario;
  return copiarUsuario(usuarioSeguro);
}

function carregarRegistros(usuarios, caminhoDados) {
  if (!fs.existsSync(caminhoDados)) {
    return usuarios.map(copiarUsuario);
  }

  try {
    const conteudo = fs.readFileSync(caminhoDados, "utf8");
    const dados = JSON.parse(conteudo);

    if (Array.isArray(dados)) {
      return dados.map(copiarUsuario);
    }

    console.warn(`Arquivo de usuarios ignorado: formato invalido em ${caminhoDados}`);
  } catch (erro) {
    console.warn(`Nao foi possivel carregar usuarios persistidos em ${caminhoDados}:`, erro.message);
  }

  return usuarios.map(copiarUsuario);
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
      const usuario = registros.find((item) => item.email === email);
      return usuario ? copiarUsuario(usuario) : null;
    },

    async listar() {
      return registros.map(removerSenha);
    },

    async salvar(dados) {
      const novoUsuario = {
        id: Math.max(...registros.map((usuario) => Number(usuario.id)), 0) + 1,
        senha: dados.senha || "123456",
        ultimo_acesso: "Ainda nao acessou",
        criado_em: new Date().toISOString().slice(0, 10),
        ...dados,
      };

      registros.unshift(novoUsuario);
      await persistirRegistros(caminhoDados, registros);
      return removerSenha(novoUsuario);
    },

    async atualizar(id, dados) {
      const index = registros.findIndex((usuario) => Number(usuario.id) === Number(id));
      if (index < 0) return null;

      registros[index] = {
        ...registros[index],
        ...dados,
        id: registros[index].id,
      };

      await persistirRegistros(caminhoDados, registros);
      return removerSenha(registros[index]);
    },
  };
}

module.exports = { criarUsuarioRepositoryMemory };
