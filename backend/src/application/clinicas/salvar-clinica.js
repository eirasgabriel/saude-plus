const { AppError } = require("../../domain/errors/app-error");

function normalizarClinica(dados) {
  return {
    nome: dados.nome?.trim(),
    bairro: dados.bairro?.trim(),
    endereco: dados.endereco?.trim() || "",
    telefone: dados.telefone?.trim() || "",
    responsavel: dados.responsavel?.trim() || "",
    especialidades: Array.isArray(dados.especialidades)
      ? dados.especialidades
      : String(dados.especialidades || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    horario: dados.horario?.trim() || "Seg a Sex: 07h as 17h",
    capacidadeDiaria: Number(dados.capacidadeDiaria || dados.capacidade_diaria || 0),
    status: dados.status || "ativa",
  };
}

function criarSalvarClinica({ clinicaRepository }) {
  return async function salvarClinica(dados) {
    const payload = normalizarClinica(dados);

    if (!payload.nome || !payload.bairro) {
      throw new AppError("Informe pelo menos o nome e o bairro da clinica.", 422, "CLINICA_INVALIDA");
    }

    if (dados.id) {
      const clinica = await clinicaRepository.atualizar(dados.id, payload);
      if (!clinica) {
        throw new AppError("Clinica nao encontrada.", 404, "CLINICA_NAO_ENCONTRADA");
      }
      return clinica;
    }

    return clinicaRepository.salvar(payload);
  };
}

module.exports = { criarSalvarClinica };
