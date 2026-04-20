
// CONFIGURAÇÃO DO BANCO DE DADOS 
// Arquivo responsável pela conexão e definição das tabelas


// Configuração de conexão com o banco 
const configuracaoBanco = {
  host: process.env.DB_HOST || "localhost",
  porta: process.env.DB_PORT || 5432,
  nomeBanco: process.env.DB_NOME || "saude_plus",
  usuario: process.env.DB_USUARIO || "admin",
  senha: process.env.DB_SENHA || "",
};


// ESTRUTURA DAS TABELAS DO SISTEMA


/*
  TABELA: usuarios
  Armazena todos os usuários do sistema com seus níveis de acesso.
  Níveis: admin_master | admin_clinica | medico | paciente
  
  Campos:
    - id              → identificador único
    - nome            → nome completo
    - email           → login do usuário (único)
    - senha_hash      → senha criptografada
    - nivel_acesso    → controla o que o usuário pode fazer
    - clinica_id      → vínculo com a clínica (médicos e admin_clinica)
    - criado_em       → data de criação do registro
*/

/*
  TABELA: clinicas
  Cadastro das unidades de saúde do município de Saquarema.
  Apenas Admin Master pode criar novas clínicas (RN3).

  Locais cadastrados para teste:
    - Bacaxá
    - Itaúna
    - Vilatur
    - Sampaio Corrêa

  Campos:
    - id              → identificador único
    - nome            → nome da clínica
    - bairro          → localização (ex: Bacaxá, Itaúna)
    - endereco        → endereço completo
    - telefone        → contato da clínica
    - ativo           → se a clínica está em funcionamento
*/

/*
  TABELA: servicos
  Especialidades e serviços oferecidos pelas clínicas.

  Campos:
    - id              → identificador único
    - clinica_id      → clínica que oferece o serviço
    - nome            → ex: Clínica Geral, Pediatria, Ginecologia
    - duracao_minutos → tempo médio de cada consulta
*/

/*
  TABELA: medicos
  Profissionais vinculados às clínicas.
  Médicos só visualizam dados da própria clínica (RN2).

  Campos:
    - id              → identificador único
    - usuario_id      → vínculo com a tabela usuarios
    - clinica_id      → clínica onde atua
    - crm             → número de registro médico
    - especialidade   → área de atuação
*/

/*
  TABELA: agendas
  Define os horários disponíveis de cada médico.
  Garante conflito zero de horários (RN1).

  Campos:
    - id              → identificador único
    - medico_id       → médico responsável
    - clinica_id      → local de atendimento
    - data            → dia da agenda
    - hora_inicio     → início do horário disponível
    - hora_fim        → fim do horário disponível
    - disponivel      → se ainda está livre para agendamento
*/

/*
  TABELA: consultas
  Registra todos os agendamentos realizados.

  Campos:
    - id              → identificador único
    - paciente_id     → usuário que agendou
    - medico_id       → médico selecionado
    - agenda_id       → horário reservado
    - clinica_id      → local da consulta
    - status          → agendada | confirmada | cancelada | realizada
    - observacoes     → anotações opcionais do paciente
    - criado_em       → data de criação do agendamento
*/

module.exports = { configuracaoBanco };
