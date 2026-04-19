/**
 * Mock de API apenas em desenvolvimento (react-scripts / webpack-dev-server).
 * Em produção (npm run compilar) este ficheiro não é incluído — use um backend real
 * ou configure o proxy no servidor (nginx, etc.).
 */

const agendasReservadas = new Set();
const consultasSalvas = [];

const HORAS = [
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

function criarIdAgenda(clinicaId, data, hora) {
  const h = hora.replace(":", "");
  return `ag-${clinicaId}-${data}-t${h}`;
}

function montarSlots(clinicaId, data, especialidade = "") {
  const seed = `${data}-${clinicaId}-${especialidade}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * (i + 1)) % 997;
  }

  return HORAS.map((hora, i) => {
    const id = criarIdAgenda(clinicaId, data, hora);
    const simuladoOcupado = (h + i) % 5 === 0;
    const reservado = agendasReservadas.has(id);
    const disponivel = !simuladoOcupado && !reservado;
    return {
      id,
      hora,
      disponivel,
      medico_id: 100 + (Number(clinicaId) % 4) * 10 + (i % 3),
    };
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => {
      body += c;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

module.exports = function mockApiDev(app) {
  app.get("/api/agendas", (req, res) => {
    const clinica = req.query.clinica;
    const data = req.query.data;
    const especialidade = req.query.especialidade || "";
    if (!clinica || !data) {
      res
        .status(400)
        .json({ mensagem: "Parâmetros clinica e data são obrigatórios." });
      return;
    }
    let slots = montarSlots(String(clinica), String(data), String(especialidade));
    const medico = req.query.medico;
    if (medico) {
      const mid = Number(medico);
      slots = slots.filter((s) => s.medico_id === mid);
    }
    res.json(slots);
  });

  app.get("/api/agendas/:agendaId/verificar", (req, res) => {
    const agendaId = decodeURIComponent(req.params.agendaId);
    const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
      String(agendaId)
    );
    if (!parsed) {
      res.json({ disponivel: false });
      return;
    }
    const especialidade = req.query.especialidade || "";
    const slots = montarSlots(parsed[1], parsed[2], String(especialidade));
    const slot = slots.find((s) => s.id === agendaId);
    const disponivel = !!(slot && slot.disponivel);
    res.json({ disponivel });
  });

  app.post("/api/consultas", async (req, res) => {
    let body;
    try {
      body = await parseJsonBody(req);
    } catch {
      res.status(400).json({ mensagem: "Corpo da requisição inválido." });
      return;
    }

    const {
      agenda_id: agendaId,
      medico_id: medicoId,
      especialidade = "",
    } = body;
    if (!agendaId) {
      res.status(400).json({ mensagem: "agenda_id é obrigatório." });
      return;
    }

    const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(
      String(agendaId)
    );
    if (!parsed) {
      res.status(400).json({ mensagem: "ID de agenda inválido." });
      return;
    }

    const slots = montarSlots(parsed[1], parsed[2], String(especialidade));
    const slot = slots.find(
      (s) =>
        s.id === agendaId &&
        (medicoId == null || Number(medicoId) === s.medico_id)
    );

    if (!slot || !slot.disponivel) {
      res.status(409).json({
        mensagem:
          "Este horário não está mais disponível. Por favor, escolha outro.",
      });
      return;
    }

    agendasReservadas.add(agendaId);
    const novaConsulta = {
      id: Date.now(),
      ...body,
      status: "agendada",
      criado_em: new Date().toISOString(),
    };
    consultasSalvas.push(novaConsulta);
    res.status(201).json({ consulta: novaConsulta });
  });

  app.patch("/api/consultas/:consultaId/cancelar", async (req, res) => {
    try {
      await parseJsonBody(req);
    } catch {
      /* ignorar body vazio */
    }
    const consultaId = Number(req.params.consultaId);
    const consulta = consultasSalvas.find((c) => Number(c.id) === consultaId);
    if (consulta) {
      consulta.status = "cancelada";
      consulta.cancelado_em = new Date().toISOString();
    }
    res.json({ ok: true, status: "cancelada" });
  });

  app.get("/api/consultas", (req, res) => {
    const paciente = req.query.paciente;
    if (!paciente) {
      res.json([]);
      return;
    }
    const pacienteId = Number(paciente);
    const resultado = consultasSalvas.filter(
      (c) => Number(c.paciente_id) === pacienteId
    );
    res.json(resultado);
  });
};
