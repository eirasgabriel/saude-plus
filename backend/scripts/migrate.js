const fs = require("fs");
const path = require("path");
const { carregarEnv } = require("../src/infrastructure/config/env");
const { criarPoolPostgres } = require("../src/infrastructure/repositories/postgres/postgres-client");

async function executar() {
  const env = carregarEnv();
  const pool = criarPoolPostgres(env);
  const migrationsDir = path.resolve(__dirname, "../migrations");

  try {
    await pool.query(`
      create table if not exists schema_migrations (
        version varchar(80) primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const aplicadas = new Set(
      (await pool.query("select version from schema_migrations")).rows.map((row) => row.version)
    );
    const arquivos = fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();

    for (const arquivo of arquivos) {
      if (aplicadas.has(arquivo)) {
        console.log(`skip - ${arquivo}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, arquivo), "utf8");
      await pool.query("begin");
      try {
        await pool.query(sql);
        await pool.query("insert into schema_migrations (version) values ($1)", [arquivo]);
        await pool.query("commit");
        console.log(`ok - ${arquivo}`);
      } catch (erro) {
        await pool.query("rollback");
        throw erro;
      }
    }
  } finally {
    await pool.end();
  }
}

executar().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
