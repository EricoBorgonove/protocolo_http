import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3333;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:4300";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    exposedHeaders: [
      "Location",
      "X-Aula",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining"
    ]
  })
);

app.use(express.json());

app.use((req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    const duracao = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${duracao}ms`);
  });
  next();
});

function resposta(req, status, titulo, explicacao, extra = {}) {
  return {
    status,
    titulo,
    explicacao,
    metodo: req.method,
    rota: req.originalUrl,
    recebidoNoBody: req.body ?? null,
    horarioServidor: new Date().toISOString(),
    ...extra
  };
}

const exemplos = [
  {
    grupo: "2xx - Sucesso",
    itens: [
      { metodo: "GET", rota: "/api/status/200", status: 200, nome: "OK" },
      { metodo: "POST", rota: "/api/status/201", status: 201, nome: "Created" },
      { metodo: "PUT", rota: "/api/status/202", status: 202, nome: "Accepted" },
      { metodo: "DELETE", rota: "/api/status/204", status: 204, nome: "No Content" }
    ]
  },
  {
    grupo: "3xx - Redirecionamento/cache",
    itens: [
      { metodo: "GET", rota: "/api/status/304", status: 304, nome: "Not Modified" }
    ]
  },
  {
    grupo: "4xx - Erro do cliente",
    itens: [
      { metodo: "POST", rota: "/api/status/400", status: 400, nome: "Bad Request" },
      { metodo: "GET", rota: "/api/status/401", status: 401, nome: "Unauthorized" },
      { metodo: "GET", rota: "/api/status/403", status: 403, nome: "Forbidden" },
      { metodo: "GET", rota: "/api/status/404", status: 404, nome: "Not Found" },
      { metodo: "PATCH", rota: "/api/status/405", status: 405, nome: "Method Not Allowed" },
      { metodo: "POST", rota: "/api/status/409", status: 409, nome: "Conflict" },
      { metodo: "POST", rota: "/api/status/422", status: 422, nome: "Unprocessable Content" },
      { metodo: "GET", rota: "/api/status/429", status: 429, nome: "Too Many Requests" },
      { metodo: "GET", rota: "/api/status/418", status: 418, nome: "I'm a teapot" }
    ]
  },
  {
    grupo: "5xx - Erro do servidor",
    itens: [
      { metodo: "GET", rota: "/api/status/500", status: 500, nome: "Internal Server Error" },
      { metodo: "GET", rota: "/api/status/503", status: 503, nome: "Service Unavailable" }
    ]
  }
];

app.get("/api", (req, res) => {
  res.status(200).json(
    resposta(req, 200, "API da aula funcionando", "Use /api/status para listar as rotas didáticas.", {
      rotasDeExemplo: "/api/status"
    })
  );
});

app.get("/api/status", (req, res) => {
  res.status(200).json({
    titulo: "Rotas didáticas de status HTTP",
    observacao: "As rotas 204 e 304 propositalmente não retornam corpo na resposta.",
    exemplos
  });
});

app.get("/api/status/200", (req, res) => {
  res.set("X-Aula", "status-200-ok");
  res.status(200).json(resposta(req, 200, "OK", "A requisição deu certo e a resposta possui corpo."));
});

app.post("/api/status/201", (req, res) => {
  res.set("Location", "/api/recursos/123");
  res.status(201).json(
    resposta(req, 201, "Created", "Um recurso foi criado com sucesso. Veja o header Location.", {
      recursoCriado: {
        id: 123,
        nome: req.body?.nome || "Exemplo criado em aula"
      }
    })
  );
});

app.put("/api/status/202", (req, res) => {
  res.status(202).json(
    resposta(req, 202, "Accepted", "A solicitação foi aceita, mas o processamento ainda poderia continuar depois.", {
      tarefa: "processamento-simulado",
      situacao: "recebida"
    })
  );
});

app.delete("/api/status/204", (req, res) => {
  res.status(204).end();
});

app.get("/api/status/304", (req, res) => {
  res.set("ETag", '"versao-aula-1"');
  res.status(304).end();
});

app.post("/api/status/400", (req, res) => {
  res.status(400).json(
    resposta(req, 400, "Bad Request", "A requisição está malformada ou faltam dados obrigatórios.", {
      problema: "Campo 'email' não enviado ou inválido.",
      exemploBodyEsperado: { email: "aluno@exemplo.com" }
    })
  );
});

app.get("/api/status/401", (req, res) => {
  res.set("WWW-Authenticate", "Bearer");
  res.status(401).json(
    resposta(req, 401, "Unauthorized", "O cliente não enviou credenciais válidas para autenticação.", {
      dica: "Em APIs reais, normalmente seria necessário enviar um token no header Authorization."
    })
  );
});

app.get("/api/status/403", (req, res) => {
  res.status(403).json(
    resposta(req, 403, "Forbidden", "O cliente foi identificado, mas não tem permissão para acessar o recurso.", {
      papelNecessario: "ADMIN"
    })
  );
});

app.get("/api/status/404", (req, res) => {
  res.status(404).json(
    resposta(req, 404, "Not Found", "A rota existe apenas para demonstrar uma resposta de recurso não encontrado.")
  );
});

app.patch("/api/status/405", (req, res) => {
  res.set("Allow", "GET, POST, PUT, DELETE");
  res.status(405).json(
    resposta(req, 405, "Method Not Allowed", "O método HTTP usado não é permitido para este recurso.", {
      metodosPermitidos: ["GET", "POST", "PUT", "DELETE"]
    })
  );
});

app.post("/api/status/409", (req, res) => {
  res.status(409).json(
    resposta(req, 409, "Conflict", "A requisição conflita com o estado atual do recurso.", {
      exemplo: "Tentativa de cadastrar um e-mail que já existe."
    })
  );
});

app.post("/api/status/422", (req, res) => {
  res.status(422).json(
    resposta(req, 422, "Unprocessable Content", "O JSON foi entendido, mas os dados não passaram nas regras de validação.", {
      errosDeValidacao: [
        "nome deve ter pelo menos 3 caracteres",
        "idade deve ser maior ou igual a 18"
      ]
    })
  );
});

app.get("/api/status/429", (req, res) => {
  res.set("Retry-After", "30");
  res.set("X-RateLimit-Limit", "5");
  res.set("X-RateLimit-Remaining", "0");
  res.status(429).json(
    resposta(req, 429, "Too Many Requests", "O cliente fez requisições demais em pouco tempo.", {
      tenteNovamenteEmSegundos: 30
    })
  );
});

app.get("/api/status/418", (req, res) => {
  res.status(418).json(
    resposta(req, 418, "I'm a teapot", "Status humorístico útil para mostrar que nem todo status aparece no dia a dia.")
  );
});

app.get("/api/status/500", (req, res) => {
  res.status(500).json(
    resposta(req, 500, "Internal Server Error", "Erro interno simulado no servidor.", {
      observacao: "Em produção, não exponha stack trace ou detalhes sensíveis."
    })
  );
});

app.get("/api/status/503", (req, res) => {
  res.set("Retry-After", "60");
  res.status(503).json(
    resposta(req, 503, "Service Unavailable", "Serviço temporariamente indisponível.", {
      tenteNovamenteEmSegundos: 60
    })
  );
});

app.get("/api/erro-com-exception", () => {
  throw new Error("Erro proposital para demonstrar middleware de erro do Express.");
});

app.use((req, res) => {
  res.status(404).json(
    resposta(req, 404, "Rota não encontrada", "Nenhuma rota cadastrada corresponde ao caminho solicitado.", {
      sugestao: "Acesse GET /api/status para ver as rotas disponíveis."
    })
  );
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json(
    resposta(req, 500, "Erro capturado pelo middleware", "Uma exception foi lançada e tratada pelo middleware de erro.", {
      mensagem: err.message
    })
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API da aula rodando em http://localhost:${PORT}`);
});
