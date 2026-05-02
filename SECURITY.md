# Politica de Seguranca

## Como Relatar

Nao abra issue publica com dados sensiveis. Envie o relato para o mantenedor do projeto com:

- rota, tela ou arquivo afetado;
- passos para reproduzir;
- impacto esperado;
- evidencias sem dados pessoais reais.

## Regras Minimas

- Nunca versionar `.env`, `backend/data/*.json`, logs, dumps ou backups.
- `JWT_SECRET` deve ter pelo menos 32 caracteres em producao.
- Senhas devem ser armazenadas apenas como hash `scrypt`.
- Toda rota `/api`, exceto login, recuperacao de senha e cadastro publico de paciente, exige `Authorization: Bearer <token>`.
- CORS deve listar origens explicitas em `CORS_ORIGINS`; nao usar `*`.
- Contas de teste devem ser rotacionadas antes de qualquer homologacao com dados reais.

## Dados Sensiveis

O projeto local usa repositórios em memoria com persistencia opcional em `backend/data`.
Esses arquivos sao artefatos de desenvolvimento e devem permanecer fora do Git.

## Checklist Antes de Publicar

```bash
npm run backend:check
npm run backend:test
npm run frontend:build
npm run lint
npm run format:check
```

## Escopo Atual

Este projeto ainda nao implementa envio real de e-mail, VAPID privado ou banco PostgreSQL em producao.
Essas integracoes devem usar variaveis de ambiente e secrets gerenciados fora do repositorio.
