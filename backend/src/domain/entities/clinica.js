const { AppError } = require("../errors/app-error");

function criarClinica(dados) {
  if (!dados.nome || !dados.bairro) {
    throw new AppError("Clinica precisa ter nome e bairro.", 422, "CLINICA_INVALIDA");
  }

  return {
    id: dados.id,
    nome: dados.nome,
    bairro: dados.bairro,
    endereco: dados.endereco || "",
    telefone: dados.telefone || "",
    especialidades: dados.especialidades || [],
    especialidadesExames: dados.especialidadesExames || [],
    fotoPerfil: dados.fotoPerfil || "",
    aberta: dados.aberta !== false,
    horario: dados.horario || "",
  };
}

module.exports = { criarClinica };
