const { criarUsuarioRepositoryMemory } = require("../src/infrastructure/repositories/memory/usuario-repository-memory");

async function main() {
  const [, , email, novaSenha] = process.argv;

  if (!email || !novaSenha || novaSenha.length < 8) {
    console.error("Uso: npm --prefix backend run user:password -- email@dominio.com NovaSenhaForte");
    process.exit(1);
  }

  const repository = criarUsuarioRepositoryMemory();
  const usuario = await repository.buscarPorEmail(email);

  if (!usuario) {
    console.error("Usuario nao encontrado.");
    process.exit(1);
  }

  await repository.atualizar(usuario.id, { senha: novaSenha });
  console.log(`Senha atualizada para ${email}.`);
}

main().catch((erro) => {
  console.error(erro.message || erro);
  process.exit(1);
});
