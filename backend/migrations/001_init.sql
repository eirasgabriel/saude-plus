create table if not exists schema_migrations (
  version varchar(80) primary key,
  applied_at timestamptz not null default now()
);

create table if not exists clinicas (
  id bigserial primary key,
  nome varchar(160) not null,
  bairro varchar(120) not null,
  endereco text not null default '',
  telefone varchar(40) not null default '',
  aberta boolean not null default true,
  status varchar(40) not null default 'ativa',
  horario varchar(120) not null default '',
  responsavel varchar(160) not null default '',
  capacidade_diaria integer not null default 0,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  especialidades jsonb not null default '[]'::jsonb,
  especialidades_exames jsonb not null default '[]'::jsonb,
  foto_perfil text not null default '',
  dados_extra jsonb not null default '{}'::jsonb,
  criada_em timestamptz not null default now()
);

create table if not exists usuarios (
  id bigserial primary key,
  nome varchar(160) not null,
  email varchar(180) not null unique,
  senha_hash varchar(255) not null,
  nivel_acesso varchar(40) not null check (
    nivel_acesso in ('admin_master', 'admin_clinica', 'medico', 'paciente')
  ),
  clinica_id bigint references clinicas(id),
  status varchar(30) not null default 'ativo',
  dados_extra jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create table if not exists agendas_reservadas (
  agenda_id text primary key,
  reservado_em timestamptz not null default now()
);

create table if not exists consultas (
  id bigserial primary key,
  paciente_id bigint not null references usuarios(id) on delete cascade,
  medico_id bigint not null references usuarios(id),
  agenda_id text not null,
  clinica_id bigint not null references clinicas(id),
  especialidade varchar(120) not null default '',
  observacoes text not null default '',
  status varchar(30) not null check (
    status in ('agendada', 'confirmada', 'cancelada', 'realizada')
  ),
  motivo_cancelamento text not null default '',
  data date,
  horario varchar(8),
  dados_extra jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  cancelado_em timestamptz
);

create table if not exists exames (
  id text primary key,
  consulta_id bigint,
  paciente_id bigint not null references usuarios(id) on delete cascade,
  medico_id bigint references usuarios(id),
  agenda_id text,
  clinica_id bigint not null references clinicas(id),
  tipo varchar(160) not null,
  data date,
  horario varchar(8),
  observacoes text not null default '',
  status varchar(40) not null default 'agendado',
  resultado_disponivel boolean not null default false,
  resultado_categoria varchar(40) not null default 'exame',
  resultado_nome_arquivo text not null default '',
  resultado_descricao text not null default '',
  resultado_anexado_em text not null default '',
  resultado_anexado_por text not null default '',
  resultado_anexado_por_nome text not null default '',
  resultado_arquivo_data_url text not null default '',
  resultado_arquivo_tipo text not null default '',
  resultado_arquivo_tamanho bigint not null default 0,
  dados_extra jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create table if not exists access_logs (
  id bigserial primary key,
  metodo varchar(12) not null,
  rota text not null,
  status_code integer not null,
  usuario_id bigint,
  nivel_acesso varchar(40),
  ip varchar(80),
  user_agent text,
  origin text,
  duracao_ms integer not null default 0,
  criado_em timestamptz not null default now()
);

create index if not exists usuarios_email_idx on usuarios (lower(email));
create index if not exists consultas_paciente_id_idx on consultas (paciente_id);
create index if not exists consultas_clinica_id_idx on consultas (clinica_id);
create index if not exists exames_paciente_id_idx on exames (paciente_id);
create index if not exists exames_clinica_id_idx on exames (clinica_id);
create index if not exists exames_consulta_id_idx on exames (consulta_id);
create index if not exists access_logs_criado_em_idx on access_logs (criado_em desc);
