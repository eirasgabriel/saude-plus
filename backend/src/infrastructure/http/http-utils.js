const { AppError } = require("../../domain/errors/app-error");

function enviarJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function enviarSemConteudo(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end();
}

function lerJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new AppError("Corpo da requisicao invalido.", 400, "JSON_INVALIDO"));
      }
    });

    req.on("error", reject);
  });
}

function tratarErro(res, erro) {
  const statusCode = erro.statusCode || 500;
  const mensagem = erro.statusCode ? erro.message : "Erro interno do servidor.";

  enviarJson(res, statusCode, {
    mensagem,
    codigo: erro.code || "ERRO_INTERNO",
  });
}

module.exports = { enviarJson, enviarSemConteudo, lerJson, tratarErro };
