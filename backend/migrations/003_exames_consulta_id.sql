alter table exames
  add column if not exists consulta_id bigint;

create index if not exists exames_consulta_id_idx on exames (consulta_id);
