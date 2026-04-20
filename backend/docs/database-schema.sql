create table usuarios (
  id bigserial primary key,
  nome varchar(160) not null,
  email varchar(180) not null unique,
  senha_hash varchar(255) not null,
  nivel_acesso varchar(40) not null check (
    nivel_acesso in ('admin_master', 'admin_clinica', 'medico', 'paciente')
  ),
  clinica_id bigint null,
  status varchar(30) not null default 'ativo',
  criado_em timestamptz not null default now()
);

create table clinicas (
  id bigserial primary key,
  nome varchar(160) not null,
  bairro varchar(120) not null,
  endereco text not null,
  telefone varchar(40),
  aberta boolean not null default true,
  horario varchar(120),
  criada_em timestamptz not null default now()
);

create table servicos (
  id bigserial primary key,
  clinica_id bigint not null references clinicas(id),
  nome varchar(120) not null,
  duracao_minutos integer not null default 30
);

create table medicos (
  id bigserial primary key,
  usuario_id bigint not null references usuarios(id),
  clinica_id bigint not null references clinicas(id),
  crm varchar(40),
  especialidade varchar(120) not null
);

create table agendas (
  id bigserial primary key,
  medico_id bigint not null references medicos(id),
  clinica_id bigint not null references clinicas(id),
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  disponivel boolean not null default true,
  unique (medico_id, data, hora_inicio)
);

create table consultas (
  id bigserial primary key,
  paciente_id bigint not null references usuarios(id),
  medico_id bigint not null references medicos(id),
  agenda_id bigint not null references agendas(id),
  clinica_id bigint not null references clinicas(id),
  especialidade varchar(120),
  observacoes text,
  status varchar(30) not null check (
    status in ('agendada', 'confirmada', 'cancelada', 'realizada')
  ),
  motivo_cancelamento text,
  criado_em timestamptz not null default now(),
  cancelado_em timestamptz null
);

alter table usuarios
  add constraint usuarios_clinica_id_fk foreign key (clinica_id) references clinicas(id);

create index consultas_paciente_id_idx on consultas (paciente_id);
create index consultas_clinica_id_idx on consultas (clinica_id);
create index agendas_clinica_data_idx on agendas (clinica_id, data);
