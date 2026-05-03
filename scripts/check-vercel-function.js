const { EventEmitter } = require("events");
const handler = require("../api/[...path].js");

class MockResponse extends EventEmitter {
  constructor(resolve) {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.body = "";
    this.resolve = resolve;
  }

  writeHead(statusCode, headers = {}) {
    this.statusCode = statusCode;
    this.headers = { ...this.headers, ...headers };
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  end(chunk = "") {
    this.body += chunk;
    this.emit("finish");
    this.resolve({
      statusCode: this.statusCode,
      headers: this.headers,
      body: this.body,
    });
  }
}

async function requisitarHealth() {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = "GET";
    req.url = "/api/health";
    req.headers = {};
    req.socket = { remoteAddress: "127.0.0.1" };

    handler(req, new MockResponse(resolve));
  });
}

async function executar() {
  const resposta = await requisitarHealth();
  const payload = JSON.parse(resposta.body);

  if (resposta.statusCode !== 200 || payload.status !== "ok") {
    throw new Error(
      `Health da function inesperado: ${resposta.statusCode} ${resposta.body}`
    );
  }

  console.log("ok - vercel function health");
}

executar().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
