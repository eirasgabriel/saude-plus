const { carregarEnv } = require("../infrastructure/config/env");
const { criarServidorHttp } = require("../infrastructure/http/create-server");
const { criarContainer } = require("./container");

const env = carregarEnv();
const container = criarContainer();
const server = criarServidorHttp(container.useCases);

server.listen(env.port, () => {
  console.log(`Backend Saude+ ouvindo em http://localhost:${env.port}`);
});
