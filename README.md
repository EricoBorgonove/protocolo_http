# Aula HTTP com React, Vite, Node/Express e Docker

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

As rotas `204` e `304` não exibem corpo porque esses status normalmente são usados sem corpo de resposta. Isso é proposital para mostrar aos alunos que nem toda resposta HTTP vem acompanhada de JSON.
