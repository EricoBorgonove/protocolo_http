import React, { useMemo, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4301";

const grupos = [
  {
    titulo: "2xx - Sucesso",
    descricao: "A requisição foi recebida, entendida e aceita.",
    exemplos: [
      { metodo: "GET", rota: "/api/status/200", status: 200, nome: "OK", body: null },
      { metodo: "POST", rota: "/api/status/201", status: 201, nome: "Created", body: { nome: "Aluno ADS" } },
      { metodo: "PUT", rota: "/api/status/202", status: 202, nome: "Accepted", body: { tarefa: "gerar-relatorio" } },
      { metodo: "DELETE", rota: "/api/status/204", status: 204, nome: "No Content", body: null }
    ]
  },
  {
    titulo: "3xx - Redirecionamento/cache",
    descricao: "O cliente precisa considerar outra condição, como cache ou redirecionamento.",
    exemplos: [
      { metodo: "GET", rota: "/api/status/304", status: 304, nome: "Not Modified", body: null }
    ]
  },
  {
    titulo: "4xx - Erro do cliente",
    descricao: "O problema está na requisição feita pelo cliente.",
    exemplos: [
      { metodo: "POST", rota: "/api/status/400", status: 400, nome: "Bad Request", body: { nome: "sem email" } },
      { metodo: "GET", rota: "/api/status/401", status: 401, nome: "Unauthorized", body: null },
      { metodo: "GET", rota: "/api/status/403", status: 403, nome: "Forbidden", body: null },
      { metodo: "GET", rota: "/api/status/404", status: 404, nome: "Not Found", body: null },
      { metodo: "PATCH", rota: "/api/status/405", status: 405, nome: "Method Not Allowed", body: { tentativa: "PATCH" } },
      { metodo: "POST", rota: "/api/status/409", status: 409, nome: "Conflict", body: { email: "repetido@exemplo.com" } },
      { metodo: "POST", rota: "/api/status/422", status: 422, nome: "Unprocessable Content", body: { nome: "Ed", idade: 15 } },
      { metodo: "GET", rota: "/api/status/429", status: 429, nome: "Too Many Requests", body: null },
      { metodo: "GET", rota: "/api/status/418", status: 418, nome: "I'm a teapot", body: null }
    ]
  },
  {
    titulo: "5xx - Erro do servidor",
    descricao: "A requisição chegou, mas o servidor falhou ou está indisponível.",
    exemplos: [
      { metodo: "GET", rota: "/api/status/500", status: 500, nome: "Internal Server Error", body: null },
      { metodo: "GET", rota: "/api/status/503", status: 503, nome: "Service Unavailable", body: null },
      { metodo: "GET", rota: "/api/erro-com-exception", status: 500, nome: "Exception tratada", body: null }
    ]
  }
];

function metodoTemBody(metodo) {
  return !["GET", "HEAD", "DELETE"].includes(metodo.toUpperCase());
}

function formatarJson(valor) {
  if (valor === "") return "(sem corpo)";
  if (valor === null || valor === undefined) return "(sem corpo)";
  if (typeof valor === "string") return valor;
  return JSON.stringify(valor, null, 2);
}

export default function App() {
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [rotaManual, setRotaManual] = useState("/api/status/200");
  const [metodoManual, setMetodoManual] = useState("GET");
  const [bodyManual, setBodyManual] = useState('{\n  "nome": "Teste manual"\n}');

  const todosExemplos = useMemo(() => grupos.flatMap((grupo) => grupo.exemplos), []);

  async function executarRequisicao(exemplo) {
    setCarregando(true);
    setErro("");

    const url = `${API_BASE_URL}${exemplo.rota}`;
    const headers = {
      "Content-Type": "application/json"
    };

    const options = {
      method: exemplo.metodo,
      headers
    };

    if (metodoTemBody(exemplo.metodo) && exemplo.body !== null && exemplo.body !== undefined) {
      options.body = typeof exemplo.body === "string" ? exemplo.body : JSON.stringify(exemplo.body);
    }

    const inicio = performance.now();

    try {
      const response = await fetch(url, options);
      const texto = await response.text();
      const duracaoMs = Math.round(performance.now() - inicio);

      let corpo;
      try {
        corpo = texto ? JSON.parse(texto) : "";
      } catch {
        corpo = texto;
      }

      setResultado({
        request: {
          metodo: exemplo.metodo,
          url,
          headers,
          body: options.body ? JSON.parse(options.body) : ""
        },
        response: {
          status: response.status,
          statusText: response.statusText || "",
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
          body: corpo
        },
        duracaoMs
      });
    } catch (err) {
      setErro(`Falha na requisição: ${err.message}. Verifique se a API está rodando em ${API_BASE_URL}.`);
    } finally {
      setCarregando(false);
    }
  }

  function executarManual() {
    let body = null;

    if (metodoTemBody(metodoManual)) {
      try {
        body = bodyManual.trim() ? JSON.parse(bodyManual) : null;
      } catch {
        setErro("O corpo manual precisa ser um JSON válido.");
        return;
      }
    }

    executarRequisicao({
      metodo: metodoManual,
      rota: rotaManual.startsWith("/") ? rotaManual : `/${rotaManual}`,
      body
    });
  }

  return (
    <main className="container">
      <section className="hero">
        <div>
          <p className="tag">React + Vite + Node/Express + Docker</p>
          <h1>Aula prática: requisição, resposta e status code HTTP</h1>
          <p>
            Clique em uma rota para observar método, URL, corpo enviado, status retornado,
            headers e corpo da resposta. API configurada em <strong>{API_BASE_URL}</strong>.
          </p>
        </div>
      </section>

      <section className="painel manual">
        <h2>Teste manual</h2>
        <div className="linha-formulario">
          <select value={metodoManual} onChange={(e) => setMetodoManual(e.target.value)}>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((metodo) => (
              <option key={metodo} value={metodo}>{metodo}</option>
            ))}
          </select>
          <input value={rotaManual} onChange={(e) => setRotaManual(e.target.value)} placeholder="/api/status/200" />
          <button onClick={executarManual} disabled={carregando}>Enviar</button>
        </div>
        {metodoTemBody(metodoManual) && (
          <textarea value={bodyManual} onChange={(e) => setBodyManual(e.target.value)} rows="5" />
        )}
      </section>

      <section className="grid-principal">
        <div className="coluna-esquerda">
          {grupos.map((grupo) => (
            <section className="painel" key={grupo.titulo}>
              <h2>{grupo.titulo}</h2>
              <p>{grupo.descricao}</p>
              <div className="botoes">
                {grupo.exemplos.map((exemplo) => (
                  <button
                    key={`${exemplo.metodo}-${exemplo.rota}`}
                    onClick={() => executarRequisicao(exemplo)}
                    disabled={carregando}
                  >
                    <span className="metodo">{exemplo.metodo}</span>
                    <span className="status">{exemplo.status}</span>
                    <span>{exemplo.nome}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="painel resultado">
          <h2>Resultado</h2>
          {carregando && <p>Enviando requisição...</p>}
          {erro && <pre className="erro">{erro}</pre>}
          {!resultado && !erro && !carregando && (
            <p>Escolha uma rota para visualizar a troca HTTP.</p>
          )}

          {resultado && !carregando && (
            <>
              <div className="resumo-status">
                <span className={resultado.response.ok ? "bolinha ok" : "bolinha erro-status"}></span>
                <strong>{resultado.response.status}</strong>
                <span>{resultado.response.statusText}</span>
                <small>{resultado.duracaoMs}ms</small>
              </div>

              <h3>Requisição</h3>
              <pre>{formatarJson(resultado.request)}</pre>

              <h3>Resposta</h3>
              <pre>{formatarJson(resultado.response)}</pre>
            </>
          )}
        </aside>
      </section>

      <section className="painel tabela">
        <h2>Resumo rápido das rotas</h2>
        <table>
          <thead>
            <tr>
              <th>Método</th>
              <th>Rota</th>
              <th>Status esperado</th>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            {todosExemplos.map((exemplo) => (
              <tr key={`${exemplo.metodo}-${exemplo.rota}`}>
                <td><code>{exemplo.metodo}</code></td>
                <td><code>{exemplo.rota}</code></td>
                <td>{exemplo.status}</td>
                <td>{exemplo.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
