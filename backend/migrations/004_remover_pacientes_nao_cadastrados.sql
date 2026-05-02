delete from exames
where not exists (
  select 1
  from usuarios
  where usuarios.id = exames.paciente_id
    and usuarios.nivel_acesso = 'paciente'
);

delete from consultas
where not exists (
  select 1
  from usuarios
  where usuarios.id = consultas.paciente_id
    and usuarios.nivel_acesso = 'paciente'
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'consultas_paciente_id_fk'
  ) then
    alter table consultas
      add constraint consultas_paciente_id_fk
      foreign key (paciente_id) references usuarios(id)
      on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'exames_paciente_id_fk'
  ) then
    alter table exames
      add constraint exames_paciente_id_fk
      foreign key (paciente_id) references usuarios(id)
      on delete cascade;
  end if;
end $$;
