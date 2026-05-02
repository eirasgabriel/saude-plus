const { carregarEnv } = require("../infrastructure/config/env");
const { criarServidorHttp } = require("../infrastructure/http/create-server");
const { criarContainer } = require("./container");

const env = carregarEnv();
const container = criarContainer(env);
const server = criarServidorHttp(container.useCases, env, {
  auditRepository: container.repositories.auditRepository,
});

server.listen(env.port, () => {
  console.log(`Backend Saude+ ouvindo em http://localhost:${env.port}`);
});

async function encerrar() {
  server.close(async () => {
    if (container.pool) {
      await container.pool.end();
    }
    process.exit(0);
  });
}

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);
