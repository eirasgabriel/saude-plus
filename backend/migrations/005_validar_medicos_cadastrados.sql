delete from exames
where medico_id is not null
  and not exists (
    select 1
    from usuarios
    where usuarios.id = exames.medico_id
      and usuarios.nivel_acesso = 'medico'
  );

delete from consultas
where not exists (
  select 1
  from usuarios
  where usuarios.id = consultas.medico_id
    and usuarios.nivel_acesso = 'medico'
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'consultas_medico_id_fk'
  ) then
    alter table consultas
      add constraint consultas_medico_id_fk
      foreign key (medico_id) references usuarios(id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'exames_medico_id_fk'
  ) then
    alter table exames
      add constraint exames_medico_id_fk
      foreign key (medico_id) references usuarios(id);
  end if;
end $$;
