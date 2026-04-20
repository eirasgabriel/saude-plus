const { consultasSeed } = require("./seeds");

function criarConsultaRepositoryMemory(consultas = consultasSeed) {
  const registros = [...consultas];

  return {
    async criar(consulta) {
      const consultaCriada = {
        ...consulta,
        id: consulta.id || Date.now(),
        criado_em: consulta.criado_em || new Date().toISOString(),
      };

      registros.push(consultaCriada);
      return consultaCriada;
    },

    async listarPorPaciente(pacienteId) {
      return registros.filter((consulta) => Number(consulta.paciente_id) === Number(pacienteId));
    },

    async listarPorClinica(clinicaId) {
      return registros.filter((consulta) => Number(consulta.clinica_id) === Number(clinicaId));
    },

    async listarTodos() {
      return registros;
    },

    async cancelar(consultaId, motivo) {
      const consulta = registros.find((item) => Number(item.id) === Number(consultaId));

      if (consulta) {
        consulta.status = "cancelada";
        consulta.motivo_cancelamento = motivo || "";
        consulta.cancelado_em = new Date().toISOString();
      }

      return { ok: true, status: "cancelada" };
    },
  };
}

module.exports = { criarConsultaRepositoryMemory };
