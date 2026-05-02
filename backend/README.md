# Backend Saude+

Base preparada para evoluir o backend do Saude+ com Clean Architecture.

## Estrutura

- `src/domain`: entidades, value objects e erros de negocio.
- `src/application`: casos de uso e portas que descrevem dependencias externas.
- `src/infrastructure`: detalhes tecnicos, como HTTP, config e repositories.
- `src/main`: composicao da aplicacao e inicializacao do servidor.

## Workflow

O fluxo do sistema fica separado em camadas:

1. Usuario interage com o frontend React.
2. Frontend chama a API HTTP em `/api/*`.
3. A API valida entrada, sessao e permissao.
4. A API aciona o backend da aplicacao, composto por casos de uso e regras de dominio.
5. O backend acessa os repositories.
6. Os repositories gravam/leem do banco PostgreSQL quando `REPOSITORY_DRIVER=postgres`.
7. O banco responde aos repositories e o resultado volta por backend, API e frontend.

## Rodando

```bash
cd backend
npm start
```

O servidor usa apenas modulos nativos do Node nesta primeira etapa. Isso deixa a arquitetura pronta sem bloquear em instalacao de dependencias.

Para usar PostgreSQL real:

```bash
cd backend
npm install
npm run db:migrate
REPOSITORY_DRIVER=postgres npm start
```

Em producao, defina `NODE_ENV=production`, `JWT_SECRET`, `RECOVERY_SECRET` e `CORS_ORIGINS`. O token de sessao passa a ser enviado em cookie HttpOnly.

## Endpoints iniciais

- `GET /health`
- `POST /api/auth/login`
- `GET /api/clinicas`
- `GET /api/clinicas/:id`
- `GET /api/agendas?clinica=1&data=2026-04-20`
- `GET /api/agendas/:agendaId/verificar?medico=110`
- `POST /api/consultas`
- `GET /api/consultas?paciente=1`
- `PATCH /api/consultas/:consultaId/cancelar`

## Proximo passo

Substituir os repositories em memoria por implementacoes PostgreSQL em `src/infrastructure/repositories/postgres`, mantendo os casos de uso intactos.
