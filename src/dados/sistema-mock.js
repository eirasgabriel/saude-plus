import { CLINICAS_SAQUAREMA } from "./clinicas-mock";

const DETALHES_CLINICAS = {
  1: {
    responsavel: "Dra. Helena Martins",
    capacidadeDiaria: 96,
    atendimentosMes: 1284,
    satisfacao: 94,
  },
  2: {
    responsavel: "Dr. Ricardo Azevedo",
    capacidadeDiaria: 74,
    atendimentosMes: 986,
    satisfacao: 91,
  },
  3: {
    responsavel: "Enf. Marcos Vieira",
    capacidadeDiaria: 42,
    atendimentosMes: 236,
    satisfacao: 86,
  },
  4: {
    responsavel: "Dra. Priscila Rocha",
    capacidadeDiaria: 88,
    atendimentosMes: 1108,
    satisfacao: 93,
  },
};

export const CLINICAS_ADMINISTRATIVAS = CLINICAS_SAQUAREMA.map((clinica) => ({
  ...clinica,
  status: clinica.aberta ? "ativa" : "temporariamente_fechada",
  responsavel: DETALHES_CLINICAS[clinica.id]?.responsavel || "Sem responsavel",
  capacidadeDiaria: DETALHES_CLINICAS[clinica.id]?.capacidadeDiaria || 40,
  atendimentosMes: DETALHES_CLINICAS[clinica.id]?.atendimentosMes || 0,
  satisfacao: DETALHES_CLINICAS[clinica.id]?.satisfacao || 80,
}));

export const ROTULOS_NIVEIS = {
  admin_master: "Admin master",
  admin_clinica: "Admin clinica",
  medico: "Medico",
  paciente: "Paciente",
};

export const USUARIOS_SISTEMA = [
  {
    id: 1,
    nome: "Ana Paula Souza",
    email: "paciente@teste.com",
    nivel_acesso: "paciente",
    clinica_id: null,
    status: "ativo",
    ultimo_acesso: "2026-04-19 08:42",
    criado_em: "2026-01-12",
  },
  {
    id: 2,
    nome: "Carlos Menezes",
    email: "admin@teste.com",
    nivel_acesso: "admin_clinica",
    clinica_id: 1,
    status: "ativo",
    ultimo_acesso: "2026-04-19 09:10",
    criado_em: "2025-12-04",
  },
  {
    id: 3,
    nome: "Mariana Costa",
    email: "master@teste.com",
    nivel_acesso: "admin_master",
    clinica_id: null,
    status: "ativo",
    ultimo_acesso: "2026-04-19 10:05",
    criado_em: "2025-11-18",
  },
  {
    id: 4,
    nome: "Roberto Lima",
    email: "medico@teste.com",
    nivel_acesso: "medico",
    clinica_id: 1,
    status: "ativo",
    ultimo_acesso: "2026-04-18 17:22",
    criado_em: "2025-12-09",
  },
  {
    id: 5,
    nome: "Beatriz Nunes",
    email: "beatriz.nunes@saude.saquarema.rj.gov.br",
    nivel_acesso: "medico",
    clinica_id: 2,
    status: "ativo",
    ultimo_acesso: "2026-04-19 07:50",
    criado_em: "2026-02-01",
  },
  {
    id: 6,
    nome: "Joao Henrique",
    email: "joao.henrique@saude.saquarema.rj.gov.br",
    nivel_acesso: "admin_clinica",
    clinica_id: 4,
    status: "ativo",
    ultimo_acesso: "2026-04-17 14:12",
    criado_em: "2026-01-23",
  },
  {
    id: 7,
    nome: "Luciana Freitas",
    email: "luciana.freitas@email.com",
    nivel_acesso: "paciente",
    clinica_id: null,
    status: "ativo",
    ultimo_acesso: "2026-04-18 11:33",
    criado_em: "2026-03-14",
  },
  {
    id: 8,
    nome: "Paulo Sergio",
    email: "paulo.sergio@email.com",
    nivel_acesso: "paciente",
    clinica_id: null,
    status: "bloqueado",
    ultimo_acesso: "2026-03-28 16:04",
    criado_em: "2026-02-20",
  },
];

export const CONSULTAS_SISTEMA = [
  {
    id: 101,
    data: "2026-04-19",
    horario: "08:00",
    clinica_id: 1,
    paciente: "Ana Paula Souza",
    medico: "Dr. Roberto Lima",
    especialidade: "Clinica Geral",
    status: "realizada",
  },
  {
    id: 102,
    data: "2026-04-19",
    horario: "08:30",
    clinica_id: 1,
    paciente: "Luciana Freitas",
    medico: "Dr. Roberto Lima",
    especialidade: "Pediatria",
    status: "confirmada",
  },
  {
    id: 103,
    data: "2026-04-19",
    horario: "09:00",
    clinica_id: 2,
    paciente: "Camila Pires",
    medico: "Dra. Beatriz Nunes",
    especialidade: "Ginecologia",
    status: "agendada",
  },
  {
    id: 104,
    data: "2026-04-19",
    horario: "09:30",
    clinica_id: 4,
    paciente: "Pedro Almeida",
    medico: "Dra. Priscila Rocha",
    especialidade: "Nutricao",
    status: "realizada",
  },
  {
    id: 105,
    data: "2026-04-18",
    horario: "10:00",
    clinica_id: 2,
    paciente: "Renata Alves",
    medico: "Dra. Beatriz Nunes",
    especialidade: "Pre-Natal",
    status: "realizada",
  },
  {
    id: 106,
    data: "2026-04-18",
    horario: "11:00",
    clinica_id: 1,
    paciente: "Andre Oliveira",
    medico: "Dr. Roberto Lima",
    especialidade: "Clinica Geral",
    status: "cancelada",
  },
  {
    id: 107,
    data: "2026-04-17",
    horario: "13:30",
    clinica_id: 4,
    paciente: "Simone Castro",
    medico: "Dra. Priscila Rocha",
    especialidade: "Pediatria",
    status: "realizada",
  },
  {
    id: 108,
    data: "2026-04-17",
    horario: "14:00",
    clinica_id: 3,
    paciente: "Vitor Cardoso",
    medico: "Dr. Daniel Moreira",
    especialidade: "Odontologia",
    status: "cancelada",
  },
  {
    id: 109,
    data: "2026-04-16",
    horario: "15:00",
    clinica_id: 1,
    paciente: "Fernanda Torres",
    medico: "Dr. Roberto Lima",
    especialidade: "Vacinacao",
    status: "realizada",
  },
  {
    id: 110,
    data: "2026-04-16",
    horario: "15:30",
    clinica_id: 2,
    paciente: "Mateus Ribeiro",
    medico: "Dra. Beatriz Nunes",
    especialidade: "Clinica Geral",
    status: "realizada",
  },
  {
    id: 111,
    data: "2026-04-15",
    horario: "08:30",
    clinica_id: 4,
    paciente: "Celia Ramos",
    medico: "Dra. Priscila Rocha",
    especialidade: "Clinica Geral",
    status: "realizada",
  },
  {
    id: 112,
    data: "2026-04-15",
    horario: "10:30",
    clinica_id: 1,
    paciente: "Rafael Dias",
    medico: "Dr. Roberto Lima",
    especialidade: "Pediatria",
    status: "confirmada",
  },
];

export function obterNomeClinica(clinicaId, clinicas = CLINICAS_ADMINISTRATIVAS) {
  return clinicas.find((clinica) => clinica.id === Number(clinicaId))?.nome || "Sem clinica";
}

export function contarPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const chave = item[campo] || "nao_informado";
    acc[chave] = (acc[chave] || 0) + 1;
    return acc;
  }, {});
}

export function obterResumoSistema(
  clinicas = CLINICAS_ADMINISTRATIVAS,
  usuarios = USUARIOS_SISTEMA,
  consultas = CONSULTAS_SISTEMA
) {
  const realizadas = consultas.filter((consulta) => consulta.status === "realizada").length;
  const canceladas = consultas.filter((consulta) => consulta.status === "cancelada").length;
  const agendadas = consultas.filter((consulta) =>
    ["agendada", "confirmada"].includes(consulta.status)
  ).length;

  return {
    totalClinicas: clinicas.length,
    clinicasAtivas: clinicas.filter((clinica) => clinica.status === "ativa").length,
    totalUsuarios: usuarios.length,
    usuariosAtivos: usuarios.filter((usuario) => usuario.status === "ativo").length,
    consultasMes: consultas.length,
    consultasRealizadas: realizadas,
    consultasPendentes: agendadas,
    consultasCanceladas: canceladas,
    taxaCancelamento: consultas.length ? Math.round((canceladas / consultas.length) * 100) : 0,
  };
}

export function obterRelatorioPorClinica(
  clinicas = CLINICAS_ADMINISTRATIVAS,
  consultas = CONSULTAS_SISTEMA
) {
  return clinicas.map((clinica) => {
    const consultasDaClinica = consultas.filter((consulta) => consulta.clinica_id === clinica.id);
    const realizadas = consultasDaClinica.filter((consulta) => consulta.status === "realizada").length;

    return {
      id: clinica.id,
      nome: clinica.nome,
      bairro: clinica.bairro,
      status: clinica.status,
      consultas: consultasDaClinica.length,
      realizadas,
      canceladas: consultasDaClinica.filter((consulta) => consulta.status === "cancelada").length,
      ocupacao: clinica.capacidadeDiaria
        ? Math.min(100, Math.round((consultasDaClinica.length / clinica.capacidadeDiaria) * 100))
        : 0,
      atendimentosMes: clinica.atendimentosMes,
      satisfacao: clinica.satisfacao,
    };
  });
}

export function obterRelatorioPorEspecialidade(consultas = CONSULTAS_SISTEMA) {
  const totais = contarPorCampo(consultas, "especialidade");
  return Object.entries(totais)
    .map(([especialidade, total]) => ({ especialidade, total }))
    .sort((a, b) => b.total - a.total);
}

export function obterRelatorioPorStatus(consultas = CONSULTAS_SISTEMA) {
  return contarPorCampo(consultas, "status");
}
