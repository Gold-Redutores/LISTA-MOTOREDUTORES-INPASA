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

export default async (request) => {
  if (request.method === "OPTIONS") return json(200, { ok: true });

  if (request.method !== "GET") {
    return json(405, { error: "Método não permitido." });
  }

  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const path = process.env.GITHUB_FILE_PATH || "data/selections.json";
    const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;

    if (!owner || !repo) {
      return json(500, { error: "Defina GITHUB_OWNER e GITHUB_REPO." });
    }

    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const url = `${API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;

    let data;
    try {
      data = await githubRequest(url, { method: "GET" });
    } catch (error) {
      if (String(error.message).includes("Not Found")) {
        return json(200, { ok: true, selections: {} });
      }
      throw error;
    }

    const content = Buffer.from((data.content || "").replace(/\n/g, ""), "base64").toString("utf-8");
    const parsed = JSON.parse(content);

    return json(200, {
      ok: true,
      selections: parsed.selections || {},
      updated_at: parsed.updated_at || null,
      sha: data.sha || null
    });
  } catch (error) {
    return json(500, { error: error.message || "Erro interno." });
  }
};
