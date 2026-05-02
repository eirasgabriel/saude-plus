const { gerarHashSenha } = require("../../security/passwords");

const HORAS_ATENDIMENTO = [
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

function copiar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function semSenha(usuario) {
  const { senha_hash: _senhaHash, senha: _senha, ...seguro } = usuario;
  return copiar(seguro);
}

function separarExtras(dados, camposConhecidos) {
  return Object.entries(dados || {}).reduce((acc, [chave, valor]) => {
    if (!camposConhecidos.includes(chave) && valor !== undefined) {
      acc[chave] = valor;
    }
    return acc;
  }, {});
}

function normalizarDataIso(valor) {
  if (!valor) return valor;

  const texto = String(valor);
  const dataIso = /^\d{4}-\d{2}-\d{2}/.exec(texto);
  if (dataIso) return dataIso[0];

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  return data.toISOString().slice(0, 10);
}

function usuarioFromRow(row) {
  if (!row) return null;
  return {
    ...(row.dados_extra || {}),
    id: Number(row.id),
    nome: row.nome,
    email: row.email,
    senha_hash: row.senha_hash,
    nivel_acesso: row.nivel_acesso,
    clinica_id: row.clinica_id == null ? null : Number(row.clinica_id),
    status: row.status,
    criado_em: row.criado_em,
  };
}

function clinicaFromRow(row) {
  if (!row) return null;
  const clinica = {
    ...(row.dados_extra || {}),
    id: Number(row.id),
    nome: row.nome,
    bairro: row.bairro,
    endereco: row.endereco,
    telefone: row.telefone,
    aberta: row.aberta,
    status: row.status,
    horario: row.horario,
    responsavel: row.responsavel,
    capacidadeDiaria: Number(row.capacidade_diaria || 0),
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    especialidades: row.especialidades || [],
    especialidadesExames: row.especialidades_exames || [],
    fotoPerfil: row.foto_perfil || "",
  };
  delete clinica.atendimentosMes;
  delete clinica.atendimentos_mes;
  delete clinica.satisfacao;
  return clinica;
}

function consultaFromRow(row) {
  if (!row) return null;
  return {
    ...(row.dados_extra || {}),
    id: Number(row.id),
    paciente_id: Number(row.paciente_id),
    medico_id: Number(row.medico_id),
    agenda_id: row.agenda_id,
    clinica_id: Number(row.clinica_id),
    especialidade: row.especialidade || "",
    observacoes: row.observacoes || "",
    status: row.status,
    motivo_cancelamento: row.motivo_cancelamento || "",
    data: normalizarDataIso(row.data),
    horario: row.horario,
    criado_em: row.criado_em,
    cancelado_em: row.cancelado_em,
  };
}

function exameFromRow(row) {
  if (!row) return null;
  return {
    ...(row.dados_extra || {}),
    id: row.id,
    consulta_id: row.consulta_id == null ? undefined : Number(row.consulta_id),
    paciente_id: Number(row.paciente_id),
    medico_id: row.medico_id == null ? undefined : Number(row.medico_id),
    agenda_id: row.agenda_id || undefined,
    clinica_id: Number(row.clinica_id),
    tipo: row.tipo,
    data: normalizarDataIso(row.data),
    horario: row.horario,
    observacoes: row.observacoes || "",
    status: row.status,
    resultado_disponivel: row.resultado_disponivel,
    resultado_categoria: row.resultado_categoria,
    resultado_nome_arquivo: row.resultado_nome_arquivo || "",
    resultado_descricao: row.resultado_descricao || "",
    resultado_anexado_em: row.resultado_anexado_em || "",
    resultado_anexado_por: row.resultado_anexado_por || "",
    resultado_anexado_por_nome: row.resultado_anexado_por_nome || "",
    resultado_arquivo_data_url: row.resultado_arquivo_data_url || "",
    resultado_arquivo_tipo: row.resultado_arquivo_tipo || "",
    resultado_arquivo_tamanho: Number(row.resultado_arquivo_tamanho || 0),
    criado_em: row.criado_em,
  };
}

function criarUsuarioRepositoryPostgres(pool) {
  return {
    async buscarPorEmail(email) {
      const { rows } = await pool.query(
        "select * from usuarios where lower(email) = lower($1) limit 1",
        [email]
      );
      return usuarioFromRow(rows[0]);
    },

    async buscarPorId(id) {
      const { rows } = await pool.query("select * from usuarios where id = $1 limit 1", [id]);
      return usuarioFromRow(rows[0]);
    },

    async listar() {
      const { rows } = await pool.query("select * from usuarios order by id desc");
      return rows.map(usuarioFromRow).map(semSenha);
    },

    async salvar(dados) {
      const extras = separarExtras(dados, [
        "nome",
        "email",
        "senha",
        "senha_hash",
        "nivel_acesso",
        "clinica_id",
        "status",
      ]);
      const { rows } = await pool.query(
        `insert into usuarios (nome, email, senha_hash, nivel_acesso, clinica_id, status, dados_extra)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb)
         returning *`,
        [
          dados.nome,
          dados.email,
          dados.senha_hash || gerarHashSenha(dados.senha),
          dados.nivel_acesso,
          dados.clinica_id || null,
          dados.status || "ativo",
          JSON.stringify(extras),
        ]
      );
      return semSenha(usuarioFromRow(rows[0]));
    },

    async atualizar(id, dados) {
      const existente = usuarioFromRow((await pool.query("select * from usuarios where id = $1", [id])).rows[0]);
      if (!existente) return null;

      const extras = { ...(existente.dados_extra || {}), ...separarExtras(dados, []) };
      const senhaHash = dados.senha ? gerarHashSenha(dados.senha) : existente.senha_hash;
      const { rows } = await pool.query(
        `update usuarios
            set nome = $1, email = $2, senha_hash = $3, nivel_acesso = $4,
                clinica_id = $5, status = $6, dados_extra = $7::jsonb
          where id = $8
          returning *`,
        [
          dados.nome || existente.nome,
          dados.email || existente.email,
          senhaHash,
          dados.nivel_acesso || existente.nivel_acesso,
          dados.clinica_id === undefined ? existente.clinica_id : dados.clinica_id,
          dados.status || existente.status,
          JSON.stringify(extras),
          id,
        ]
      );
      return semSenha(usuarioFromRow(rows[0]));
    },
  };
}

function criarClinicaRepositoryPostgres(pool) {
  const camposClinica = [
    "id",
    "nome",
    "bairro",
    "endereco",
    "telefone",
    "aberta",
    "status",
    "horario",
    "responsavel",
    "capacidadeDiaria",
    "capacidade_diaria",
    "atendimentosMes",
    "atendimentos_mes",
    "satisfacao",
    "latitude",
    "longitude",
    "especialidades",
    "especialidadesExames",
    "especialidades_exames",
    "fotoPerfil",
    "foto_perfil",
  ];

  async function gravar(dados, id = null) {
    const valores = [
      dados.nome,
      dados.bairro,
      dados.endereco || "",
      dados.telefone || "",
      dados.aberta ?? dados.status === "ativa",
      dados.status || "ativa",
      dados.horario || "",
      dados.responsavel || "",
      dados.capacidadeDiaria || dados.capacidade_diaria || 0,
      dados.latitude,
      dados.longitude,
      JSON.stringify(dados.especialidades || []),
      JSON.stringify(dados.especialidadesExames || dados.especialidades_exames || []),
      dados.fotoPerfil || dados.foto_perfil || "",
      JSON.stringify(separarExtras(dados, camposClinica)),
    ];

    const sql = id
      ? `update clinicas
            set nome=$1, bairro=$2, endereco=$3, telefone=$4, aberta=$5, status=$6,
                horario=$7, responsavel=$8, capacidade_diaria=$9,
                latitude=$10, longitude=$11, especialidades=$12::jsonb,
                especialidades_exames=$13::jsonb, foto_perfil=$14, dados_extra=$15::jsonb
          where id=$16 returning *`
      : `insert into clinicas
          (nome, bairro, endereco, telefone, aberta, status, horario, responsavel,
           capacidade_diaria, latitude, longitude,
           especialidades, especialidades_exames, foto_perfil, dados_extra)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,$14,$15::jsonb)
         returning *`;

    const { rows } = await pool.query(sql, id ? [...valores, id] : valores);
    return clinicaFromRow(rows[0]);
  }

  return {
    async listar() {
      const { rows } = await pool.query("select * from clinicas order by id");
      return rows.map(clinicaFromRow);
    },
    async buscarPorId(id) {
      const { rows } = await pool.query("select * from clinicas where id = $1", [id]);
      return clinicaFromRow(rows[0]);
    },
    async salvar(dados) {
      return gravar(dados);
    },
    async atualizar(id, dados) {
      const atual = await this.buscarPorId(id);
      if (!atual) return null;
      return gravar({ ...atual, ...dados }, id);
    },
  };
}

function criarAgendaRepositoryPostgres(pool) {
  function criarIdAgenda(clinicaId, data, hora) {
    return `ag-${clinicaId}-${data}-t${hora.replace(":", "")}`;
  }

  function extrairDadosAgendaId(agendaId) {
    const parsed = /^ag-(\d+)-(\d{4}-\d{2}-\d{2})-t(\d{2})(\d{2})$/.exec(String(agendaId));
    if (!parsed) return null;
    return { clinicaId: parsed[1], data: parsed[2], hora: `${parsed[3]}:${parsed[4]}` };
  }

  async function idsReservados(ids) {
    const { rows } = await pool.query(
      "select agenda_id from agendas_reservadas where agenda_id = any($1::text[])",
      [ids]
    );
    return new Set(rows.map((row) => row.agenda_id));
  }

  async function montarSlots(clinicaId, data) {
    const ids = HORAS_ATENDIMENTO.map((hora) => criarIdAgenda(clinicaId, data, hora));
    const reservados = await idsReservados(ids);

    return HORAS_ATENDIMENTO.map((hora, index) => {
      const id = ids[index];
      return {
        id,
        hora,
        disponivel: !reservados.has(id),
        medico_id: 100 + (Number(clinicaId) % 4) * 10 + (index % 3),
      };
    });
  }

  return {
    async listarHorarios({ clinicaId, data, medicoId = null, especialidade = "" }) {
      let slots = await montarSlots(String(clinicaId), String(data), String(especialidade));
      if (medicoId != null && medicoId !== "") {
        slots = slots.filter((slot) => Number(slot.medico_id) === Number(medicoId));
      }
      return slots;
    },
    async verificarDisponibilidade({ agendaId, especialidade = "" }) {
      const agenda = extrairDadosAgendaId(agendaId);
      if (!agenda) return { disponivel: false };
      const slots = await montarSlots(agenda.clinicaId, agenda.data, especialidade);
      const slot = slots.find((item) => item.id === agendaId);
      return { disponivel: !!slot?.disponivel };
    },
    async reservar(agendaId) {
      await pool.query(
        "insert into agendas_reservadas (agenda_id) values ($1) on conflict (agenda_id) do nothing",
        [agendaId]
      );
    },
    async liberar(agendaId) {
      await pool.query("delete from agendas_reservadas where agenda_id = $1", [agendaId]);
    },
  };
}

function criarConsultaRepositoryPostgres(pool) {
  return {
    async criar(consulta) {
      const extras = separarExtras(consulta, []);
      const { rows } = await pool.query(
        `insert into consultas
          (paciente_id, medico_id, agenda_id, clinica_id, especialidade, observacoes,
           status, data, horario, criado_em, dados_extra)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
         returning *`,
        [
          consulta.paciente_id,
          consulta.medico_id,
          consulta.agenda_id,
          consulta.clinica_id,
          consulta.especialidade,
          consulta.observacoes,
          consulta.status,
          consulta.data,
          consulta.horario,
          consulta.criado_em,
          JSON.stringify(extras),
        ]
      );
      return consultaFromRow(rows[0]);
    },
    async listarPorPaciente(pacienteId) {
      const { rows } = await pool.query("select * from consultas where paciente_id = $1 order by data desc, horario desc", [pacienteId]);
      return rows.map(consultaFromRow);
    },
    async listarPorClinica(clinicaId) {
      const { rows } = await pool.query("select * from consultas where clinica_id = $1 order by data desc, horario desc", [clinicaId]);
      return rows.map(consultaFromRow);
    },
    async listarPorClinicaEMedico(clinicaId, medicoId) {
      const { rows } = await pool.query(
        "select * from consultas where clinica_id = $1 and medico_id = $2 order by data desc, horario desc",
        [clinicaId, medicoId]
      );
      return rows.map(consultaFromRow);
    },
    async listarTodos() {
      const { rows } = await pool.query("select * from consultas order by data desc, horario desc");
      return rows.map(consultaFromRow);
    },
    async buscarPorId(consultaId) {
      const { rows } = await pool.query("select * from consultas where id = $1 limit 1", [consultaId]);
      return consultaFromRow(rows[0]);
    },
    async cancelar(consultaId, motivo) {
      await pool.query(
        `update consultas
            set status = 'cancelada', motivo_cancelamento = $1, cancelado_em = now()
          where id = $2`,
        [motivo || "", consultaId]
      );
      return { ok: true, status: "cancelada" };
    },
  };
}

function criarExameRepositoryPostgres(pool) {
  async function salvarLinha(exame, id = exame.id || `exame-${Date.now()}`) {
    const extras = separarExtras(exame, []);
    const { rows } = await pool.query(
      `insert into exames
        (id, consulta_id, paciente_id, medico_id, agenda_id, clinica_id, tipo, data, horario,
         observacoes, status, resultado_disponivel, resultado_categoria,
         resultado_nome_arquivo, resultado_descricao, resultado_anexado_em,
         resultado_anexado_por, resultado_anexado_por_nome, resultado_arquivo_data_url,
         resultado_arquivo_tipo, resultado_arquivo_tamanho, criado_em, dados_extra)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23::jsonb)
       on conflict (id) do update set
         consulta_id=excluded.consulta_id, paciente_id=excluded.paciente_id, medico_id=excluded.medico_id, agenda_id=excluded.agenda_id,
         clinica_id=excluded.clinica_id, tipo=excluded.tipo, data=excluded.data, horario=excluded.horario,
         observacoes=excluded.observacoes, status=excluded.status, resultado_disponivel=excluded.resultado_disponivel,
         resultado_categoria=excluded.resultado_categoria, resultado_nome_arquivo=excluded.resultado_nome_arquivo,
         resultado_descricao=excluded.resultado_descricao, resultado_anexado_em=excluded.resultado_anexado_em,
         resultado_anexado_por=excluded.resultado_anexado_por, resultado_anexado_por_nome=excluded.resultado_anexado_por_nome,
         resultado_arquivo_data_url=excluded.resultado_arquivo_data_url, resultado_arquivo_tipo=excluded.resultado_arquivo_tipo,
         resultado_arquivo_tamanho=excluded.resultado_arquivo_tamanho, dados_extra=excluded.dados_extra
       returning *`,
      [
        id,
        exame.consulta_id || null,
        exame.paciente_id,
        exame.medico_id || null,
        exame.agenda_id || null,
        exame.clinica_id,
        exame.tipo,
        exame.data,
        exame.horario,
        exame.observacoes || "",
        exame.status,
        exame.resultado_disponivel === true,
        exame.resultado_categoria || "exame",
        exame.resultado_nome_arquivo || "",
        exame.resultado_descricao || "",
        exame.resultado_anexado_em || "",
        exame.resultado_anexado_por || "",
        exame.resultado_anexado_por_nome || "",
        exame.resultado_arquivo_data_url || "",
        exame.resultado_arquivo_tipo || "",
        exame.resultado_arquivo_tamanho || 0,
        exame.criado_em || new Date().toISOString(),
        JSON.stringify(extras),
      ]
    );
    return exameFromRow(rows[0]);
  }

  return {
    async criar(exame) {
      return salvarLinha(exame);
    },
    async listarPorPaciente(pacienteId) {
      const { rows } = await pool.query("select * from exames where paciente_id = $1 order by data desc, horario desc", [pacienteId]);
      return rows.map(exameFromRow);
    },
    async listarPorClinica(clinicaId) {
      const { rows } = await pool.query("select * from exames where clinica_id = $1 order by data desc, horario desc", [clinicaId]);
      return rows.map(exameFromRow);
    },
    async listarPorClinicaEMedico(clinicaId, medicoId) {
      const { rows } = await pool.query(
        "select * from exames where clinica_id = $1 and medico_id = $2 order by data desc, horario desc",
        [clinicaId, medicoId]
      );
      return rows.map(exameFromRow);
    },
    async listarTodos() {
      const { rows } = await pool.query("select * from exames order by data desc, horario desc");
      return rows.map(exameFromRow);
    },
    async buscarPorId(exameId) {
      const { rows } = await pool.query("select * from exames where id = $1 limit 1", [exameId]);
      return exameFromRow(rows[0]);
    },
    async atualizar(exameId, dados) {
      const atual = exameFromRow((await pool.query("select * from exames where id = $1", [exameId])).rows[0]);
      if (!atual) return null;
      return salvarLinha({ ...atual, ...dados }, exameId);
    },
    async substituirPorClinica(clinicaId, examesAtualizados) {
      const ids = examesAtualizados.map((exame) => String(exame.id));
      await pool.query("delete from exames where clinica_id = $1 and not (id = any($2::text[]))", [clinicaId, ids]);
      return Promise.all(examesAtualizados.map((exame) => salvarLinha({ ...exame, clinica_id: clinicaId }, exame.id)));
    },
    async excluir(exameId) {
      await pool.query("delete from exames where id = $1", [exameId]);
      return { ok: true };
    },
  };
}

function criarAuditRepositoryPostgres(pool) {
  return {
    async registrarAcesso(evento) {
      await pool.query(
        `insert into access_logs
          (metodo, rota, status_code, usuario_id, nivel_acesso, ip, user_agent, origin, duracao_ms)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          evento.metodo,
          evento.rota,
          evento.statusCode,
          evento.usuarioId,
          evento.nivelAcesso,
          evento.ip,
          evento.userAgent,
          evento.origin,
          evento.duracaoMs,
        ]
      );
    },
  };
}

function criarRepositoriesPostgres(pool) {
  return {
    usuarioRepository: criarUsuarioRepositoryPostgres(pool),
    clinicaRepository: criarClinicaRepositoryPostgres(pool),
    agendaRepository: criarAgendaRepositoryPostgres(pool),
    consultaRepository: criarConsultaRepositoryPostgres(pool),
    exameRepository: criarExameRepositoryPostgres(pool),
    auditRepository: criarAuditRepositoryPostgres(pool),
  };
}

module.exports = { criarRepositoriesPostgres };
