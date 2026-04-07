# Saúde+ — Sistema de Agendamento de Consultas

Sistema web para gerenciamento de consultas médicas no município de Saquarema, com diferentes níveis de acesso (Paciente, Admin Clínica e Admin Master).

---

## Visão Geral

O **Saúde+** é uma aplicação desenvolvida em React com foco em:

* Experiência mobile para pacientes
* Painel administrativo para clínicas e prefeitura
* Agendamento simples e rápido
* Controle de acesso por nível de usuário

---

## Tipos de Usuário

* **Paciente**

  * Visualiza clínicas
  * Agenda consultas

* **Admin Clínica**

  * Gerencia agenda da clínica
  * Visualiza consultas

* **Admin Master (Prefeitura)**

  * Gerencia todas as clínicas
  * Controle total do sistema

---

## Tecnologias Utilizadas

* **React.js** → Interface
* **JavaScript (ES6+)** → Lógica
* **JSX** → Estrutura de componentes
* **Tailwind CSS** → Estilização
* **React Router DOM** → Navegação
* **Node.js + NPM** → Ambiente de execução

---

## Estrutura do Projeto

```
/saude-plus
│ package.json
│ tailwind.config.js
│ postcss.config.js
│
├── /public
│   └── index.html
│
├── /src
│   ├── index.js
│   ├── index.css
│   │
│   ├── /telas
│   │   ├── login.jsx
│   │   ├── home-paciente.jsx
│   │   ├── admin-painel.jsx
│   │   └── admin-master.jsx
│   │
│   ├── /componentes
│   │   ├── botao.jsx
│   │   └── card-clinica.jsx
│   │
│   ├── /logica-de-controle
│   │   ├── auth.js
│   │   └── agenda.js
│   │
│   ├── /caminhos-do-sistema
│   │   └── rotas.js
│   │
│   └── /configuracoes
│       └── banco-dados.js
```

---

## Como Rodar o Projeto

### 1. Instalar dependências

```
npm install
```

---

### 2. Rodar o projeto

```
npm run iniciar
```

---

### 3. Acessar no navegador

```
http://localhost:3000
```

---

## Usuários de Teste

Use esses acessos para testar:

```
Paciente:
email: paciente@teste.com
senha: 123456

Admin Clínica:
email: admin@teste.com
senha: 123456

Admin Master:
email: master@teste.com
senha: 123456
```

---

## Regras de Negócio

* RN1: Não pode haver conflito de horários (um médico por vez)
* RN2: Médicos só acessam dados da própria clínica
* RN3: Apenas Admin Master pode criar novas clínicas

---

## Identidade Visual

* Azul Claro: `#60A5FA`
* Branco: `#FFFFFF`
* Estilo: Minimalista, moderno e responsivo

---

## Status do Projeto

* Login funcional com validação
* Rotas protegidas por nível de acesso
* Navegação entre telas
* Painéis administrativos em construção
* Integração com backend pendente

---

## Próximos Passos

* Integração com API (backend)
* Banco de dados real
* Sistema de agendamento completo
* Dashboard com métricas
* Cadastro de clínicas e médicos

---

## Licença

Este projeto é de uso educacional e para desenvolvimento do sistema Saúde+.

---


Projeto em evolução contínua.
