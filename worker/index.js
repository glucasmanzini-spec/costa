const MODEL = "@cf/ibm-granite/granite-4.0-h-micro";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100000;

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function sha256(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}
async function hashPassword(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(new Uint8Array(bits))}`;
}
async function verifyPassword(password, stored) {
  const [scheme, iterationsText, saltText, expectedText] = String(stored).split("$");
  if (scheme !== "pbkdf2") return false;
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 100000) return false;
  const salt = base64UrlToBytes(saltText);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256
  ));
  const expected = base64UrlToBytes(expectedText);
  if (bits.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ expected[i];
  return diff === 0;
}
async function createSession(userId, env) {
  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = bytesToBase64Url(await sha256(token));
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), userId, tokenHash, expires).run();
  return token;
}
function cookieValue(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  const entry = cookies.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return entry ? entry.slice(name.length + 1) : null;
}
function sessionCookie(token, maxAge = SESSION_DAYS * 86400) {
  return `costa_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
async function currentUser(request, env) {
  const token = cookieValue(request, "costa_session");
  if (!token) return null;
  const tokenHash = bytesToBase64Url(await sha256(token));
  const row = await env.DB.prepare(
    "SELECT users.id, users.email, users.display_name, users.avatar_url FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?"
  ).bind(tokenHash, new Date().toISOString()).first();
  return row || null;
}
function validOrigin(request) {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}
async function authRoutes(request, env, url) {
  if (!validOrigin(request)) return json({ error: "Origem não permitida." }, 403);

  if (url.pathname === "/api/auth/register" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const displayName = String(body.displayName || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      return json({ error: "Informe um e-mail válido." }, 400);
    if (password.length < 10 || password.length > 128)
      return json({ error: "A senha precisa ter entre 10 e 128 caracteres." }, 400);
    if (displayName.length < 2 || displayName.length > 50)
      return json({ error: "O nome precisa ter entre 2 e 50 caracteres." }, 400);
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return json({ error: "Este e-mail já possui uma conta." }, 409);
    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    try {
      await env.DB.prepare(
        "INSERT INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)"
      ).bind(userId, email, passwordHash, displayName).run();
    } catch (error) {
      console.error("Registration error", error);
      return json({ error: "Não foi possível criar a conta." }, 500);
    }
    const token = await createSession(userId, env);
    return json({ user: { id: userId, email, display_name: displayName } }, 201, {
      "Set-Cookie": sessionCookie(token)
    });
  }

  if (url.pathname === "/api/auth/login" && request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = await env.DB.prepare(
      "SELECT id, email, display_name, avatar_url, password_hash FROM users WHERE email = ?"
    ).bind(email).first();
    if (!user || !(await verifyPassword(password, user.password_hash)))
      return json({ error: "E-mail ou senha incorretos." }, 401);
    const token = await createSession(user.id, env);
    return json({ user: { id: user.id, email: user.email, display_name: user.display_name, avatar_url: user.avatar_url } }, 200, {
      "Set-Cookie": sessionCookie(token)
    });
  }

  if (url.pathname === "/api/auth/me" && request.method === "GET") {
    const user = await currentUser(request, env);
    return user ? json({ user }) : json({ user: null }, 200, {
      "Set-Cookie": sessionCookie("", 0)
    });
  }

  if (url.pathname === "/api/auth/logout" && request.method === "POST") {
    const token = cookieValue(request, "costa_session");
    if (token) {
      const tokenHash = bytesToBase64Url(await sha256(token));
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    }
    return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
  }
  return null;
}


async function characterRoutes(request, env) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Entre na sua conta para gerenciar personagens." }, 401);

  if (request.method === "GET") {
    const result = await env.DB.prepare(
      "SELECT id, name, tagline, description, greeting, avatar_url, visibility, created_at FROM characters WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(user.id).all();
    return json({ characters: result.results || [] });
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }
    const name = String(body.name || "").trim();
    const tagline = String(body.tagline || "").trim();
    const description = String(body.description || "").trim();
    const greeting = String(body.greeting || "").trim();
    const avatarUrl = body.avatarUrl == null ? null : String(body.avatarUrl);
    if (name.length < 2 || name.length > 40) return json({ error: "O nome precisa ter entre 2 e 40 caracteres." }, 400);
    if (description.length < 2 || description.length > 1500) return json({ error: "A descrição precisa ter entre 2 e 1.500 caracteres." }, 400);
    if (tagline.length > 100 || greeting.length > 500) return json({ error: "A frase curta ou saudação é muito longa." }, 400);
    if (avatarUrl && (!/^data:image\/(jpeg|png|webp);base64,/.test(avatarUrl) || avatarUrl.length > 700000))
      return json({ error: "A imagem precisa ser JPG, PNG ou WebP e ter até aproximadamente 500 KB." }, 400);
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO characters (id, user_id, name, tagline, description, greeting, avatar_url, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, 'private')"
    ).bind(id, user.id, name, tagline, description, greeting || `Olá! Eu sou ${name}. Sobre o que vamos conversar?`, avatarUrl).run();
    return json({ character: { id, name, tagline, description, greeting: greeting || `Olá! Eu sou ${name}. Sobre o que vamos conversar?`, avatar_url: avatarUrl, visibility: "private" } }, 201);
  }
  return json({ error: "Método não permitido." }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/characters") {
      try { return await characterRoutes(request, env); }
      catch (error) { console.error("Character error:", error); return json({ error: "Não foi possível carregar ou salvar personagens." }, 500); }
    }

    if (url.pathname.startsWith("/api/auth/")) {
      try {
        const response = await authRoutes(request, env, url);
        if (response) return response;
      } catch (error) {
        console.error("Auth error:", error);
        return json({ error: "Erro interno de autenticação." }, 500);
      }
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, app: "Costa", provider: "Cloudflare Workers AI", model: MODEL });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "Corpo JSON inválido." }, 400); }
      const { messages, character } = body ?? {};
      if (!Array.isArray(messages) || messages.length === 0)
        return json({ error: "Envie pelo menos uma mensagem." }, 400);
      const safeMessages = messages.slice(-8).map(message => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content ?? "").slice(0, 1800)
      })).filter(message => message.content.length > 0);
      const systemPrompt = [
        `Você é ${String(character?.name || "um personagem").slice(0, 80)}.`,
        String(character?.description || "Converse de forma natural e amigável.").slice(0, 1200),
        "Responda em português brasileiro, a menos que a pessoa peça outro idioma.",
        "Mantenha a personalidade do personagem e não afirme ser uma pessoa real."
      ].join(" ");
      try {
        const result = await env.AI.run(MODEL, {
          messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
          max_tokens: 300,
          temperature: 0.8
        });
        const reply = result?.response || result?.choices?.[0]?.message?.content;
        if (!reply) return json({ error: "O modelo não retornou uma resposta de texto." }, 502);
        return json({ reply });
      } catch (error) {
        console.error("Workers AI error:", error);
        return json({ error: "A IA não conseguiu responder. Verifique o binding AI e a cota do Workers AI." }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) return json({ error: "Rota não encontrada." }, 404);
    return env.ASSETS.fetch(request);
  }
};
