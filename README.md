# atölye — for Neşe

A small, quiet web app for downloading YouTube videos — set by hand, in
Turkish first, with restraint.  Hosted on GitHub Pages.  Once it is wired up,
Neşe pastes a link, picks a format, and it downloads — there is nothing to
configure on her side.

> Bu README iki dilde yazıldı.  This README is bilingual.

---

## Türkçe

### Bu nedir?

Bir bağlantı yapıştırırsın, biçimi seçersin (podcast notları için, yazı
çalışması için, hızlı izleme, sadece dinlemek için), iner.  Dosya adları
doğrudan Obsidian kasanın kuralına uyar: `2026-04-29 — başlık.uzantı`.

Son on indirilen, yalnızca senin tarayıcında saklanır.  Hiçbir yere
gönderilmez.

### Mimari

GitHub Pages statik siteler barındırır; tarayıcı YouTube’dan doğrudan medya
indiremez (CORS ve YouTube’un bot korumaları).  Bu yüzden gerçek çıkarmayı
küçük bir aracıya yaptırıyoruz: [**cobalt**](https://github.com/imputnet/cobalt).

Cobalt’ın genel sunucusu (`api.cobalt.tools`) tarayıcılardan üçüncü taraf
çağrılara kapalı.  İki kademeli kuruyoruz:

```
  tarayıcı  ──POST /──▶  Cloudflare Worker  ──POST /──▶  cobalt
                          (Origin kontrolü,                (API anahtarını
                           anahtarı ekler)                  ister)
```

Worker, cobalt API anahtarını **gizli olarak** tutar; tarayıcıya hiç
gitmez.  Worker yalnızca `https://hamzasahin.github.io` Origin’inden
gelen çağrıları kabul eder.  Cobalt tunnel cevabı verirse, tarayıcı o tek
seferlik URL’ye doğrudan gider — Worker dosyayı taşımaz.

### Bir kerelik kurulum (Hamza için)

Tüm adımlar `cloudflare-worker/README.md` içinde detaylı.  Özet:

1. **Cobalt’ı bir yere kur.**  Hetzner CX22 + Docker + Caddy (~€4/ay) en
   pratik yol.  API anahtarını aç (`API_KEY_URL`); CORS’u kapalı tut.
2. **Worker’ı dağıt.**
   ```bash
   cd cloudflare-worker
   npx wrangler deploy
   npx wrangler secret put COBALT_URL
   npx wrangler secret put COBALT_API_KEY
   ```
3. **Worker URL’sini `app.js` içinde `DEFAULT_API_BASE` olarak yapıştır,
   commit et.**  Pages otomatik dağıtır.
4. Bitti.  Neşe siteyi açar, çalışır.

### Geliştirme

Hiçbir derleme adımı yok.  `index.html`, `styles.css`, `app.js`.

```bash
python3 -m http.server 8000
# ardından http://localhost:8000
```

`DEFAULT_API_BASE` boş bırakıldığında uygulama `ayarlar` çekmecesini
açar; oraya geçici bir cobalt veya Worker adresi girersin.

### Yayınlama (GitHub Pages)

`main` dalına push.  Repo’nun *Settings → Pages* bölümünde **GitHub Actions**
seçili olsun.  `.github/workflows/pages.yml` zaten dahili — push’tan sonra
birkaç dakika içinde yayında.  Worker dizini Pages’e dahil edilmez.

### Eğer cobalt bir gün kapanırsa

`cobaltCall` (`app.js`) cobalt’a özel iki şey yapar: gönderdiği JSON
gövdesi ve cevabı yorumlama.  Yeni bir kaynağa geçirmek için yalnızca o
fonksiyon ve aynı şeyi konuşan Worker güncellenir.  Yedek planlar:

* Worker’ın içinde `yt-dlp` çağıran bir mikro-servis (Fly.io, Render).
  Worker olduğu gibi kalır, sadece `COBALT_URL` o yeni servise yönelir.
* Cloudflare Tunnel + ev sunucusunda `yt-dlp` veren küçük bir API.

---

## English

### What this is

A small, hand-set web app: paste a YouTube link, pick a purpose-named format
(*for podcast notes*, *for close study*, *quick watch*, *just to listen*),
download.  Filenames come out shaped for Obsidian: `2026-04-29 — title.ext`.

The last ten downloads live only in this browser.  Nothing is sent anywhere.

### Architecture

GitHub Pages serves static files only; browsers can't extract YouTube media
directly (CORS + anti-scraping).  We delegate the real extraction to
[**cobalt**](https://github.com/imputnet/cobalt) and put a thin Cloudflare
Worker in front of it:

```
  browser  ──POST /──▶  Cloudflare Worker  ──POST /──▶  cobalt
                         (Origin check,                  (key-protected)
                          adds key from secret)
```

The Worker holds cobalt's API key as a Worker secret — it never reaches
the browser.  The Worker only accepts requests whose `Origin` matches
the configured allowlist (default: `https://hamzasahin.github.io`).
When cobalt returns a `tunnel` URL, the browser hits that URL directly
(anchor click; the Worker does not proxy file bytes).

### One-time setup (for the maintainer)

Full steps in [`cloudflare-worker/README.md`](cloudflare-worker/README.md).
Outline:

1. **Stand up cobalt.**  Hetzner CX22 + Docker + Caddy (~€4/mo) is the
   path of least resistance.  Turn API keys on (`API_KEY_URL`); leave
   CORS off so the cobalt host isn't browser-callable.
2. **Deploy the Worker.**
   ```bash
   cd cloudflare-worker
   npx wrangler deploy
   npx wrangler secret put COBALT_URL
   npx wrangler secret put COBALT_API_KEY
   ```
3. **Paste the Worker URL into `app.js`** as `DEFAULT_API_BASE`, commit.
   Pages redeploys automatically.
4. Done.  Neşe opens the page; it works.

### Development

No build step.  `index.html`, `styles.css`, `app.js`.

```bash
python3 -m http.server 8000
# http://localhost:8000
```

When `DEFAULT_API_BASE` is empty, the app opens its **settings** drawer
on first load so you can paste a temporary cobalt or Worker URL while
developing.

### Deployment

Push to `main`.  In *Settings → Pages*, choose **GitHub Actions** as the
source.  `.github/workflows/pages.yml` only copies the four
browser-facing files; the `cloudflare-worker/` directory stays out of
the Pages bundle.

### If cobalt ever breaks

`cobaltCall` in `app.js` does two cobalt-specific things: the JSON body
it sends and how it interprets the response.  Swap providers by editing
that function and the matching forward in the Worker.  Drop-in options:

* A `yt-dlp` micro-service hosted on Fly.io or Render — the Worker stays
  identical, you only change `COBALT_URL`.
* Cloudflare Tunnel to a home-server `yt-dlp` API.

---

### A note

This was built for one specific person.  See
[`PERSONALIZATION.md`](PERSONALIZATION.md) for every choice that was made
with her in mind.
