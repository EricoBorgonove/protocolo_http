# Aula: Protocolo HTTP — Frontend (React) + API (Node/Express)

Este repositório é uma base para prática de protocolos HTTP em aula.
O projeto contém duas partes:

- `api/` — servidor Node/Express que expõe rotas de exemplo (status codes, erros).
- `frontend/` — app React usando Vite para testar requisições e inspecionar respostas.
Objetivo: permitir que os alunos façam requisições (GET/POST/PUT/DELETE), vejam
status, headers, corpo de requisição/resposta e tempos de execução.

## Como executar (recomendado — Docker)

```bash
docker compose up --build -d
```

Após o start pelo Docker:

- Frontend: `http://localhost:4300`
- API:      `http://localhost:4301`

### Executar localmente (opcional)

Frontend

```bash
cd frontend
npm install
npm run dev
# abre em http://localhost:5173 (no container mapeado para 4300)
```

API

```bash
cd api
npm install
npm run dev
# roda em http://localhost:3333 (no container mapeado para 4301)
```

## Como usar o front

- Abra `http://localhost:4300` e clique nas rotas para enviar requisições.
- A área **Resultado** mostra request/response, status e headers.
- Você pode testar rotas manuais no painel **Teste manual**.

## Dicas de debugging

- Abra o DevTools (Console) para ver erros de runtime.
- Instale o [React DevTools](https://react.dev/link/react-devtools) para inspecionar componentes.
- Se a página aparecer vazia, verifique o Console — um `ReferenceError: React is not defined` foi corrigido adicionando a importação em `frontend/src/App.jsx`.

Commit e push
- O README foi atualizado e as mudanças foram enviadas para `origin/main`.

Se tiver dúvidas, cole aqui os erros do Console ou peça para eu rodar uma captura headless.
## Visão geral

Projeto didático para demonstrar, em sala de aula, como funcionam:

- requisições HTTP;
- respostas HTTP;
- métodos HTTP;
- headers;
- body da requisição;
- body da resposta;
- status codes de sucesso, redirecionamento/cache, erro do cliente e erro do servidor.

## Portas usadas

Para evitar conflito com aplicações comuns que usam `3000`, `3001`, `5173`, `8080` ou `5432`, este projeto publica portas diferentes no host:

| Serviço | Porta dentro do container | Porta no computador |
|---|---:|---:|
| Frontend React/Vite | 5173 | 4300 |
| API Node/Express | 3333 | 4301 |

Acesse:

```bash
http://localhost:4300
```

API:

```bash
http://localhost:4301/api
```

## Como rodar

Na pasta do projeto:

```bash
docker compose up --build
```

Para parar:

```bash
docker compose down
```

Para ver os containers:

```bash
docker ps
```

## Estrutura

```text
aula-http-react-vite-node-docker/
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── server.js
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── styles.css
```

## Rotas principais da API

### Sucesso - 2xx

| Método | Rota | Status | Explicação |
|---|---|---:|---|
| GET | `/api/status/200` | 200 | Requisição bem-sucedida. |
| POST | `/api/status/201` | 201 | Recurso criado. Retorna header `Location`. |
| PUT | `/api/status/202` | 202 | Requisição aceita para processamento. |
| DELETE | `/api/status/204` | 204 | Sucesso sem corpo na resposta. |

### Redirecionamento/cache - 3xx

| Método | Rota | Status | Explicação |
|---|---|---:|---|
| GET | `/api/status/304` | 304 | Conteúdo não modificado. Não retorna corpo. |

### Erros do cliente - 4xx

| Método | Rota | Status | Explicação |
|---|---|---:|---|
| POST | `/api/status/400` | 400 | Requisição inválida. |
| GET | `/api/status/401` | 401 | Falta autenticação. |
| GET | `/api/status/403` | 403 | Sem permissão. |
| GET | `/api/status/404` | 404 | Recurso não encontrado. |
| PATCH | `/api/status/405` | 405 | Método não permitido. |
| POST | `/api/status/409` | 409 | Conflito com o estado atual do recurso. |
| POST | `/api/status/422` | 422 | Dados entendidos, mas inválidos semanticamente. |
| GET | `/api/status/429` | 429 | Muitas requisições. |
| GET | `/api/status/418` | 418 | Status humorístico. |

### Erros do servidor - 5xx

| Método | Rota | Status | Explicação |
|---|---|---:|---|
| GET | `/api/status/500` | 500 | Erro interno simulado. |
| GET | `/api/status/503` | 503 | Serviço temporariamente indisponível. |
| GET | `/api/erro-com-exception` | 500 | Lança erro proposital e passa pelo middleware de erro. |

## Testes via curl

```bash
curl -i http://localhost:4301/api/status/200
```

```bash
curl -i -X POST http://localhost:4301/api/status/201 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Aluno ADS"}'
```

```bash
curl -i -X DELETE http://localhost:4301/api/status/204
```

```bash
curl -i http://localhost:4301/api/status/401
```

```bash
curl -i http://localhost:4301/api/erro-com-exception
```

## Observação didática

As rotas `204` e `304` não exibem corpo porque esses status normalmente são usados sem corpo de resposta. Isso é proposital — mostra aos alunos que nem toda resposta HTTP vem acompanhada de um corpo JSON.
