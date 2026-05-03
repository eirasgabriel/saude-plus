create table if not exists push_subscriptions (
  endpoint text primary key,
  usuario_id bigint references usuarios(id) on delete cascade,
  subscription jsonb not null,
  atualizado_em timestamptz not null default now()
);

create index if not exists push_subscriptions_usuario_id_idx
  on push_subscriptions (usuario_id);
