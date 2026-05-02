const testes = {
  ...require("./security.test"),
  ...require("./authorization-http.test"),
  ...require("./exames.test"),
  ...require("./relatorios.test"),
  ...require("./auditoria.test"),
};

let falhas = 0;

(async () => {
  for (const [nome, executar] of Object.entries(testes)) {
    try {
      await executar();
      console.log(`ok - ${nome}`);
    } catch (erro) {
      falhas += 1;
      console.error(`falha - ${nome}`);
      console.error(erro);
    }
  }

  if (falhas > 0) {
    process.exit(1);
  }
})();
