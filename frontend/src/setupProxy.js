const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    createProxyMiddleware("/api", {
      target: process.env.REACT_APP_BACKEND_URL || "http://localhost:3333",
      changeOrigin: true,
      onError(err, req, res) {
        res.writeHead(503, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(
          JSON.stringify({
            mensagem:
              "Nao foi possivel conectar ao backend. Inicie a API com npm run backend ou use npm run iniciar para subir frontend e backend juntos.",
            codigo: "BACKEND_INDISPONIVEL",
          })
        );
      },
    })
  );
};
