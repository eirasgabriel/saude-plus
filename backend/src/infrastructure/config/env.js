function carregarEnv() {
  return {
    port: Number(process.env.PORT || 3333),
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET || "dev-secret",
  };
}

module.exports = { carregarEnv };
