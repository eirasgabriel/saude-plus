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

## PWA E Notificacoes

O frontend registra `/sw.js`, usa `/manifest.json` e fica pronto para instalacao como PWA. As notificacoes funcionam em modo demonstracao local quando a permissao do navegador e concedida.

Para criar subscriptions push reais, configure a chave publica VAPID no frontend:

```bash
REACT_APP_VAPID_PUBLIC_KEY=sua_chave_publica
```

A chave privada VAPID deve ficar apenas no backend quando o envio real via `web-push` for conectado.

## Google Maps

A tela de detalhes da clinica usa Google Maps. Para habilitar o mapa, o marcador e o preenchimento automatico de coordenadas pelo endereco, configure uma chave publica do Google Maps no frontend com Maps JavaScript API e geocodificacao habilitadas:

```bash
REACT_APP_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

Sem essa variavel, o sistema usa um iframe/link do Google Maps como fallback para desenvolvimento.

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
