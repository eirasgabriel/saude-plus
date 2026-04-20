const { clinicasSeed } = require("./seeds");

function criarClinicaRepositoryMemory(clinicas = clinicasSeed) {
  const registros = [...clinicas];

  return {
    async listar() {
      return registros;
    },

    async buscarPorId(id) {
      return registros.find((clinica) => Number(clinica.id) === Number(id)) || null;
    },

    async salvar(dados) {
      const clinica = {
        id: Math.max(...registros.map((item) => Number(item.id)), 0) + 1,
        atendimentosMes: 0,
        satisfacao: 0,
        emoji: "+",
        ...dados,
        aberta: dados.status ? dados.status === "ativa" : dados.aberta !== false,
      };

      registros.unshift(clinica);
      return clinica;
    },

    async atualizar(id, dados) {
      const index = registros.findIndex((clinica) => Number(clinica.id) === Number(id));
      if (index < 0) return null;

      registros[index] = {
        ...registros[index],
        ...dados,
        id: registros[index].id,
        aberta: dados.status ? dados.status === "ativa" : dados.aberta ?? registros[index].aberta,
      };

      return registros[index];
    },
  };
}

module.exports = { criarClinicaRepositoryMemory };
