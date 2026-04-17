const DEFAULT_BRANCH = "main";
const API_BASE = "https://api.github.com";

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

function toBase64(text) {
  return Buffer.from(text, "utf-8").toString("base64");
}

async function githubRequest(url, options = {}) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("Variável GITHUB_TOKEN não configurada.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw new Error(data?.message || `GitHub API HTTP ${response.status}`);
  }

  return data;
}

async function getCurrentFile({ owner, repo, path, branch }) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

  try {
    const data = await githubRequest(url, { method: "GET" });
    return { sha: data.sha, contentBase64: data.content?.replace(/\n/g, "") || "" };
  } catch (error) {
    if (String(error.message).includes("Not Found")) {
      return { sha: null, contentBase64: null };
    }
    throw error;
  }
}

export default async (request) => {
  if (request.method === "OPTIONS") return json(200, { ok: true });

  if (request.method !== "POST") {
    return json(405, { error: "Método não permitido." });
  }

  try {
    const {
      selections,
      message = "Atualiza seleções do dashboard",
      path = process.env.GITHUB_FILE_PATH || "data/selections.json",
      branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH
    } = await request.json();

    if (!selections || typeof selections !== "object") {
      return json(400, { error: "Campo 'selections' inválido." });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!owner || !repo) {
      return json(500, { error: "Defina GITHUB_OWNER e GITHUB_REPO." });
    }

    const current = await getCurrentFile({ owner, repo, path, branch });

    const payload = {
      updated_at: new Date().toISOString(),
      selections
    };

    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const url = `${API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}`;

    const body = {
      message,
      content: toBase64(JSON.stringify(payload, null, 2)),
      branch
    };

    if (current.sha) {
      body.sha = current.sha;
    }

    const data = await githubRequest(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return json(200, {
      ok: true,
      path,
      branch,
      commitSha: data.commit?.sha || null
    });
  } catch (error) {
    return json(500, { error: error.message || "Erro interno." });
  }
};
