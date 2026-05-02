insert into clinicas
  (id, nome, bairro, endereco, telefone, aberta, status, horario, responsavel,
   capacidade_diaria, latitude, longitude,
   especialidades, especialidades_exames)
values
  (1, 'UBS Bacaxa', 'Bacaxa', 'Rua Principal, 100 - Bacaxa, Saquarema/RJ', '(22) 2651-0001', true, 'ativa', 'Seg a Sex: 07h as 17h', 'Dra. Helena Martins', 96, -22.9169, -42.6169, '["Clinica Geral","Pediatria","Vacinacao"]'::jsonb, '["Hemograma completo","Glicemia em jejum","Urina tipo 1"]'::jsonb),
  (2, 'UBS Itauna', 'Itauna', 'Av. Oceanica, 250 - Itauna, Saquarema/RJ', '(22) 2651-0002', true, 'ativa', 'Seg a Sex: 08h as 16h', 'Dr. Ricardo Azevedo', 74, -22.9338, -42.4939, '["Clinica Geral","Ginecologia","Pre-Natal"]'::jsonb, '["Colesterol total e fracoes","Ultrassonografia","Preventivo"]'::jsonb),
  (3, 'UBS Vilatur', 'Vilatur', 'Rua das Flores, 45 - Vilatur, Saquarema/RJ', '(22) 2651-0003', false, 'temporariamente_fechada', 'Temporariamente fechada', 'Enf. Marcos Vieira', 42, -22.9344, -42.6835, '["Clinica Geral","Odontologia"]'::jsonb, '["Raio-X","Hemograma completo"]'::jsonb),
  (4, 'UBS Sampaio Correa', 'Sampaio Correa', 'Estrada Municipal, 78 - Sampaio Correa, Saquarema/RJ', '(22) 2651-0004', true, 'ativa', 'Seg a Sex: 07h as 17h', 'Dra. Priscila Rocha', 88, -22.8747, -42.6594, '["Clinica Geral","Pediatria","Nutricao"]'::jsonb, '["Hemograma completo","Glicemia em jejum","Colesterol total e fracoes"]'::jsonb)
on conflict (id) do nothing;

insert into usuarios
  (id, nome, email, senha_hash, nivel_acesso, clinica_id, status)
values
  (1, 'Ana Paula Souza', 'paciente@teste.com', 'scrypt$16384$8$1$CHvPQ6HpoRDFkO5KSsRuuQ$UdAyxdrgH7slH-wpnEeDOU2lb4OZvOK1qh56QVt6GE7vT3YgUF65cimAEt9dSZw5ZfrS-JDUHqIqQuuOOUiY3A', 'paciente', null, 'ativo'),
  (2, 'Admin Clinica', 'admin@teste.com', 'scrypt$16384$8$1$6-7ymote7gLSdCrn8IhMGw$frC74lgotYm3wK91bpj_hNalkMRS7qE1bzh3RsjFPV4gGU700hV6R15miuz6bEFNKXbU-NTJhir8yBMwN4wKOw', 'admin_clinica', 1, 'ativo'),
  (3, 'Admin Master', 'master@teste.com', 'scrypt$16384$8$1$6i1wiUVZNDLT9sushfhklw$zrTZtjIhzNQg6xrl0EOKSCgqd2NEUO1ZZ2smpU56x0qMc0_iVlDJvTxl9EVMK9w_E-Fa81QZDMqnuh0Yh5Nz7w', 'admin_master', null, 'ativo'),
  (4, 'Roberto Lima', 'medico@teste.com', 'scrypt$16384$8$1$XTPnto1nQSZvRTuljf_RHg$5DQbUTypZm4vxdM1-tP5kotnBmUH2fYJ8Htx8Dlrdvhf4vDOdXX4aHyKwmp-DovgKWM96qp686MEGWqBd4MsBw', 'medico', 1, 'ativo')
on conflict (id) do nothing;

select setval('clinicas_id_seq', greatest((select max(id) from clinicas), 1), true);
select setval('usuarios_id_seq', greatest((select max(id) from usuarios), 1), true);
