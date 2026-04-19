/**
 * Dados mock das UBS — usados na home do paciente e na tela de agendamento.
 * Substituir por API quando o backend existir.
 */

export const CLINICAS_SAQUAREMA = [
  {
    id: 1,
    nome: "UBS Bacaxá",
    bairro: "Bacaxá",
    endereco: "Rua Principal, 100 — Bacaxá, Saquarema/RJ",
    telefone: "(22) 2651-0001",
    especialidades: ["Clínica Geral", "Pediatria", "Vacinação"],
    aberta: true,
    horario: "Seg a Sex: 07h às 17h",
    emoji: "🏥",
  },
  {
    id: 2,
    nome: "UBS Itaúna",
    bairro: "Itaúna",
    endereco: "Av. Oceânica, 250 — Itaúna, Saquarema/RJ",
    telefone: "(22) 2651-0002",
    especialidades: ["Clínica Geral", "Ginecologia", "Pré-Natal"],
    aberta: true,
    horario: "Seg a Sex: 08h às 16h",
    emoji: "🏨",
  },
  {
    id: 3,
    nome: "UBS Vilatur",
    bairro: "Vilatur",
    endereco: "Rua das Flores, 45 — Vilatur, Saquarema/RJ",
    telefone: "(22) 2651-0003",
    especialidades: ["Clínica Geral", "Odontologia"],
    aberta: false,
    horario: "Temporariamente fechada",
    emoji: "🏣",
  },
  {
    id: 4,
    nome: "UBS Sampaio Corrêa",
    bairro: "Sampaio Corrêa",
    endereco: "Estrada Municipal, 78 — Sampaio Corrêa, Saquarema/RJ",
    telefone: "(22) 2651-0004",
    especialidades: ["Clínica Geral", "Pediatria", "Nutrição"],
    aberta: true,
    horario: "Seg a Sex: 07h às 17h",
    emoji: "🏥",
  },
];

export function buscarClinicaPorId(id) {
  const n = Number(id);
  return CLINICAS_SAQUAREMA.find((c) => c.id === n) ?? null;
}
