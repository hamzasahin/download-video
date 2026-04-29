// nese-atolye proxy — sits between the static GitHub Pages app and the
// cobalt instance. Holds the cobalt API key as a Worker secret so the
// browser never sees it. Validates the request Origin against an
// allowlist so random callers can't ride the key.
//
// Deploy:
//   1. Run cobalt somewhere reachable (Hetzner + Caddy, fly.io, etc.)
//      with API keys enabled. See ./README.md.
//   2. wrangler deploy (config in wrangler.toml).
//   3. Set the three secrets:
//        npx wrangler secret put COBALT_URL
//        npx wrangler secret put COBALT_API_KEY
//      And pin the allowed origin(s) via vars.ALLOWED_ORIGINS in wrangler.toml.
//   4. Paste the Worker URL into app.js → DEFAULT_API_BASE.

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const wildcard = allowed.includes("*");
    const ok = wildcard || allowed.includes(origin);
    const allowOrigin = wildcard ? "*" : origin;

    const cors = {
      "Access-Control-Allow-Origin": ok ? allowOrigin : "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!ok) {
      return json({ status: "error", error: { code: "proxy.origin_denied" } }, 403, cors);
    }

    if (request.method !== "POST") {
      return json({ status: "error", error: { code: "proxy.method_not_allowed" } }, 405, cors);
    }

    const cobaltBase = (env.COBALT_URL || "").replace(/\/+$/, "");
    if (!cobaltBase) {
      return json({ status: "error", error: { code: "proxy.cobalt_unconfigured" } }, 500, cors);
    }

    const body = await request.text();

    const headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    if (env.COBALT_API_KEY) {
      headers["Authorization"] = `Api-Key ${env.COBALT_API_KEY}`;
    }

    let upstream;
    try {
      upstream = await fetch(cobaltBase + "/", { method: "POST", headers, body });
    } catch {
      return json({ status: "error", error: { code: "proxy.upstream_unreachable" } }, 502, cors);
    }

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "application/json",
        ...cors,
      },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
