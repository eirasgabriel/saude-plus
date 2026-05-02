function criarPoolPostgres(env = {}) {
  let Pool;
  try {
    ({ Pool } = require("pg"));
  } catch {
    throw new Error("Instale a dependencia pg para usar REPOSITORY_DRIVER=postgres.");
  }

  const config = env.databaseUrl
    ? { connectionString: env.databaseUrl, ssl: env.database?.ssl ? { rejectUnauthorized: false } : false }
    : {
        host: env.database?.host,
        port: env.database?.port,
        database: env.database?.database,
        user: env.database?.user,
        password: env.database?.password,
        ssl: env.database?.ssl ? { rejectUnauthorized: false } : false,
      };

  return new Pool(config);
}

module.exports = { criarPoolPostgres };
