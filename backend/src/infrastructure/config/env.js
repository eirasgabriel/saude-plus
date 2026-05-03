const fs = require("fs");
const path = require("path");

function aplicarEnvArquivo(caminhoArquivo) {
  if (!fs.existsSync(caminhoArquivo)) return;

  const linhas = fs.readFileSync(caminhoArquivo, "utf8").split(/\r?\n/);
  for (const linha of linhas) {
    const texto = linha.trim();
    if (!texto || texto.startsWith("#")) continue;

    const separador = texto.indexOf("=");
    if (separador < 0) continue;

    const chave = texto.slice(0, separador).trim();
    const valor = texto.slice(separador + 1).trim().replace(/^["']|["']$/g, "");
    if (chave && process.env[chave] == null) {
      process.env[chave] = valor;
    }
  }
}

function carregarArquivosEnv() {
  const raizRepo = path.resolve(__dirname, "../../../..");
  const raizBackend = path.resolve(__dirname, "../../..");

  aplicarEnvArquivo(path.join(raizRepo, ".env"));
  aplicarEnvArquivo(path.join(raizBackend, ".env"));
}

function carregarEnv() {
  carregarArquivosEnv();

  const jwtSecret = process.env.JWT_SECRET || "";
  const recoverySecret = process.env.RECOVERY_SECRET || "";
  const nodeEnv = process.env.NODE_ENV || "development";
  const databaseUrl = process.env.DATABASE_URL || "";

  if (nodeEnv === "production" && jwtSecret.length < 32) {
    throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres em producao.");
  }

  if (nodeEnv === "production" && recoverySecret.length < 32) {
    throw new Error("RECOVERY_SECRET deve ter pelo menos 32 caracteres em producao.");
  }

  return {
    port: Number(process.env.PORT || 3333),
    nodeEnv,
    jwtSecret: jwtSecret || "dev-secret-change-me-in-env",
    corsOrigins: String(process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    tokenTtlSegundos: Number(process.env.TOKEN_TTL_SEGUNDOS || 60 * 60 * 8),
    requestBodyLimitBytes: Number(process.env.REQUEST_BODY_LIMIT_BYTES || 10 * 1024 * 1024),
    relatoriosDebug: process.env.RELATORIOS_DEBUG === "true",
    recoverySecret,
    usarCookieSessao: nodeEnv === "production" || process.env.AUTH_COOKIE_ENABLED === "true",
    sessionCookieName: process.env.SESSION_COOKIE_NAME || "saude_token",
    cookieSameSite: process.env.COOKIE_SAMESITE || (nodeEnv === "production" ? "Lax" : "Lax"),
    cookieSecure:
      process.env.COOKIE_SECURE == null
        ? nodeEnv === "production"
        : process.env.COOKIE_SECURE === "true",
    repositoryDriver: process.env.REPOSITORY_DRIVER || (databaseUrl ? "postgres" : "memory"),
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || process.env.REACT_APP_VAPID_PUBLIC_KEY || "",
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || "",
    vapidSubject: process.env.VAPID_SUBJECT || "mailto:admin@saude-plus.local",
    databaseUrl,
    database: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "saude_plus",
      user: process.env.DB_USER || "saude_plus_app",
      password: process.env.DB_PASSWORD || "",
      ssl: process.env.DB_SSL === "true",
    },
  };
}

module.exports = { carregarEnv };
