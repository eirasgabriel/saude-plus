const { usuariosSeed } = require("./seeds");

function criarUsuarioRepositoryMemory(usuarios = usuariosSeed) {
  const registros = [...usuarios];

  return {
    async buscarPorEmail(email) {
      return registros.find((usuario) => usuario.email === email) || null;
    },

    async listar() {
      return registros.map(({ senha, ...usuario }) => usuario);
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
      const { senha, ...usuarioSeguro } = novoUsuario;
      return usuarioSeguro;
    },

    async atualizar(id, dados) {
      const index = registros.findIndex((usuario) => Number(usuario.id) === Number(id));
      if (index < 0) return null;

      registros[index] = {
        ...registros[index],
        ...dados,
        id: registros[index].id,
      };

      const { senha, ...usuarioSeguro } = registros[index];
      return usuarioSeguro;
    },
  };
}

module.exports = { criarUsuarioRepositoryMemory };
