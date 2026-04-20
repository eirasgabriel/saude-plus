# Backend Saude+

Base preparada para evoluir o backend do Saude+ com Clean Architecture.

## Estrutura

- `src/domain`: entidades, value objects e erros de negocio.
- `src/application`: casos de uso e portas que descrevem dependencias externas.
- `src/infrastructure`: detalhes tecnicos, como HTTP, config e repositories.
- `src/main`: composicao da aplicacao e inicializacao do servidor.

## Rodando

```bash
cd backend
npm start
```

O servidor usa apenas modulos nativos do Node nesta primeira etapa. Isso deixa a arquitetura pronta sem bloquear em instalacao de dependencias.

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
