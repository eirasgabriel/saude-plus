const { criarAutenticarUsuario } = require("../application/auth/autenticar-usuario");
const { criarListarHorariosAgenda } = require("../application/agenda/listar-horarios-agenda");
const { criarVerificarDisponibilidade } = require("../application/agenda/verificar-disponibilidade");
const { criarListarClinicas } = require("../application/clinicas/listar-clinicas");
const { criarObterClinica } = require("../application/clinicas/obter-clinica");
const { criarSalvarClinica } = require("../application/clinicas/salvar-clinica");
const { criarCriarConsulta } = require("../application/consultas/criar-consulta");
const { criarListarConsultasClinica } = require("../application/consultas/listar-consultas-clinica");
const { criarListarConsultasPaciente } = require("../application/consultas/listar-consultas-paciente");
const { criarCancelarConsulta } = require("../application/consultas/cancelar-consulta");
const { criarObterRelatoriosSistema } = require("../application/sistema/obter-relatorios-sistema");
const { criarListarUsuarios } = require("../application/usuarios/listar-usuarios");
const { criarSalvarUsuario } = require("../application/usuarios/salvar-usuario");
const { criarAgendaRepositoryMemory } = require("../infrastructure/repositories/memory/agenda-repository-memory");
const { criarClinicaRepositoryMemory } = require("../infrastructure/repositories/memory/clinica-repository-memory");
const { criarConsultaRepositoryMemory } = require("../infrastructure/repositories/memory/consulta-repository-memory");
const { criarUsuarioRepositoryMemory } = require("../infrastructure/repositories/memory/usuario-repository-memory");

function criarContainer() {
  const usuarioRepository = criarUsuarioRepositoryMemory();
  const clinicaRepository = criarClinicaRepositoryMemory();
  const agendaRepository = criarAgendaRepositoryMemory();
  const consultaRepository = criarConsultaRepositoryMemory();
  const pushSubscriptions = [];

  async function salvarPushSubscription(subscription) {
    if (!subscription || !subscription.endpoint) {
      return { salvo: false, total: pushSubscriptions.length };
    }

    const existente = pushSubscriptions.findIndex(
      (item) => item.endpoint === subscription.endpoint
    );

    if (existente >= 0) {
      pushSubscriptions[existente] = subscription;
    } else {
      pushSubscriptions.push(subscription);
    }

    return { salvo: true, total: pushSubscriptions.length };
  }

  return {
    repositories: {
      usuarioRepository,
      clinicaRepository,
      agendaRepository,
      consultaRepository,
    },
    useCases: {
      autenticarUsuario: criarAutenticarUsuario({ usuarioRepository }),
      listarUsuarios: criarListarUsuarios({ usuarioRepository }),
      salvarUsuario: criarSalvarUsuario({ usuarioRepository }),
      listarClinicas: criarListarClinicas({ clinicaRepository }),
      obterClinica: criarObterClinica({ clinicaRepository }),
      salvarClinica: criarSalvarClinica({ clinicaRepository }),
      listarHorariosAgenda: criarListarHorariosAgenda({ agendaRepository }),
      verificarDisponibilidade: criarVerificarDisponibilidade({ agendaRepository }),
      criarConsulta: criarCriarConsulta({ agendaRepository, consultaRepository }),
      listarConsultasClinica: criarListarConsultasClinica({ consultaRepository }),
      listarConsultasPaciente: criarListarConsultasPaciente({ consultaRepository }),
      cancelarConsulta: criarCancelarConsulta({ consultaRepository }),
      obterRelatoriosSistema: criarObterRelatoriosSistema({
        clinicaRepository,
        usuarioRepository,
        consultaRepository,
      }),
      salvarPushSubscription,
    },
  };
}

module.exports = { criarContainer };
