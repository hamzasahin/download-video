# nese-atolye proxy

A Cloudflare Worker that sits between the static GitHub Pages app and a
self-hosted cobalt instance.  The point: keep the cobalt API key off the
client, and pin the allowed Origin so random callers can't ride your key.

```
  browser  ──POST /──▶  Worker  ──POST /──▶  cobalt
  (no key)              (origin              (Api-Key
                         check,              header from
                         adds key)           Worker secret)
```

For YouTube, cobalt typically returns `status: "tunnel"` with a one-time
URL that points at the cobalt instance itself.  The browser then hits
that tunnel URL directly (anchor click, no CORS) to download the file.
The Worker never proxies the bytes.

---

## One-time setup

### 1. Stand up cobalt

You need a small machine where cobalt can run.  Three reasonable paths:

* **Hetzner CX22 (~€4/mo) + Docker + Caddy.**  Most flexible; you own the
  box.  Steps below.
* **fly.io free tier.**  Run `cobalt` in a Fly app; no machine to manage,
  but cold starts can add a few seconds to first request.
* **Cloudflare Tunnel** to expose a home-server cobalt without opening
  any port.  Nice if you already have a NAS at home.

The Hetzner path:

```bash
# on the VPS
mkdir cobalt && cd cobalt
curl -O https://raw.githubusercontent.com/imputnet/cobalt/main/docker-compose.example.yml
mv docker-compose.example.yml docker-compose.yml
```

Edit `docker-compose.yml`:

```yaml
environment:
  API_URL: "https://cobalt.your-domain.com/"
  API_KEY_URL: "file:///keys.json"     # turn on key-based auth
  RATELIMIT_WINDOW: "60"
  RATELIMIT_MAX: "30"
  CORS_WILDCARD: "0"                   # we don't want browsers calling cobalt directly
  CORS_URL: ""                         # leave empty; only the Worker will call it
volumes:
  - ./keys.json:/keys.json:ro
```

Generate a UUID for the key:

```bash
python3 -c 'import uuid;print(uuid.uuid4())'
# e.g. 1f4a2c8b-7e22-4d0a-9aa1-1d3e9c0a4b21
```

Put it in `keys.json`:

```json
{
  "1f4a2c8b-7e22-4d0a-9aa1-1d3e9c0a4b21": {
    "name": "nese-atolye",
    "limit": "default"
  }
}
```

Front it with Caddy:

```caddy
cobalt.your-domain.com {
  reverse_proxy localhost:9000
}
```

`docker compose up -d`, point DNS at the VPS, you're done.

### 2. Deploy the Worker

```bash
cd cloudflare-worker
npx wrangler login
npx wrangler deploy
```

Set the secrets (these are stored encrypted on Cloudflare; never in git):

```bash
npx wrangler secret put COBALT_URL
# paste:  https://cobalt.your-domain.com

npx wrangler secret put COBALT_API_KEY
# paste:  1f4a2c8b-7e22-4d0a-9aa1-1d3e9c0a4b21
```

Update `wrangler.toml` if your GitHub Pages URL is different from the
default (`https://hamzasahin.github.io`).  After editing, redeploy:

```bash
npx wrangler deploy
```

The Worker URL will look like `https://nese-atolye.<your-account>.workers.dev`.

### 3. Wire the app

Open `app.js` in the repo root and set:

```js
const DEFAULT_API_BASE = "https://nese-atolye.<your-account>.workers.dev";
```

Commit and push to `main`.  GitHub Pages redeploys; Neşe just opens the
site and it works.

---

## Smoke test

```bash
curl -i \
  -H "Origin: https://hamzasahin.github.io" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  https://nese-atolye.<your-account>.workers.dev/
```

You should get back a JSON body with `status: "tunnel"` (or `"redirect"`)
and a `url` field.  If you see `proxy.origin_denied`, your `Origin`
header doesn't match `ALLOWED_ORIGINS`.  If you see
`proxy.upstream_unreachable`, the Worker can't reach `COBALT_URL`.

---

## Troubleshooting

| Symptom in the app                              | Likely cause                                  |
|-------------------------------------------------|-----------------------------------------------|
| *"Sunucuya ulaşılamadı"* every time             | Worker URL wrong in `app.js`, or Worker down. |
| *"Sunucu bir api anahtarı istiyor"*             | `COBALT_API_KEY` secret missing or wrong.     |
| Works on desktop, fails on phone                | Phone Origin differs (rare); check logs.       |
| All requests denied                             | `ALLOWED_ORIGINS` doesn't include your origin. |

Tail Worker logs while reproducing:

```bash
npx wrangler tail
```
