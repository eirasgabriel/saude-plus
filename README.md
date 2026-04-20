# Saude+

Sistema de agendamento de consultas para Saquarema, organizado como monorepo:

- `frontend`: aplicacao React.
- `backend`: API Node em Clean Architecture.

## Como Rodar

Instale as dependencias do frontend, se necessario:

```bash
cd frontend
npm install
```

Na raiz do projeto, rode tudo junto:

```bash
npm run iniciar
```

Esse comando inicia o backend e o frontend no mesmo terminal. Se preferir rodar separado, use:

```bash
npm run backend
npm run frontend
```

O frontend fica em `http://localhost:3000` e encaminha `/api` para o backend em `http://localhost:3333`.

## Scripts Da Raiz

- `npm run iniciar`: inicia backend e frontend juntos.
- `npm run dev`: alias de desenvolvimento para iniciar backend e frontend juntos.
- `npm run frontend`: inicia somente o React em `frontend/`.
- `npm run frontend:build`: compila o React em `frontend/build`.
- `npm run backend`: inicia a API em `backend/`.
- `npm run backend:check`: valida a sintaxe do backend.
- `npm run compilar`: alias para `npm run frontend:build`.

## Usuarios De Teste

```text
Paciente:
email: paciente@teste.com
senha: 123456

Admin Clinica:
email: admin@teste.com
senha: 123456

Admin Master:
email: master@teste.com
senha: 123456

Medico:
email: medico@teste.com
senha: 123456
```

## Estrutura

```text
saude-plus/
  backend/
    src/
      application/
      domain/
      infrastructure/
      main/
  frontend/
    public/
    src/
    package.json
  package.json
```

## Observacao

O frontend consome o backend via API. Nao ha mais dados mockados no frontend.
