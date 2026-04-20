# Repositories PostgreSQL

Esta pasta fica reservada para as implementacoes reais dos repositories.

Quando o banco entrar, crie arquivos como:

- `usuario-repository-postgres.js`
- `clinica-repository-postgres.js`
- `agenda-repository-postgres.js`
- `consulta-repository-postgres.js`

Cada implementacao deve obedecer as portas descritas em `src/application/ports/repositories.js`. Assim, os casos de uso nao precisam mudar quando sairmos dos repositories em memoria.
