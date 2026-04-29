# atölye — for Neşe

A small, quiet web app for downloading YouTube videos — set by hand, in
Turkish first, with restraint.  Hosted on GitHub Pages, no backend of its own,
no tracking.

> Bu README iki dilde yazıldı.  This README is bilingual.

---

## Türkçe

### Bu nedir?

Bir bağlantı yapıştırırsın, biçimi seçersin (podcast notları için, yazı çalışması
için, hızlı izleme, sadece dinlemek için), iner.  Dosya adları doğrudan
Obsidian kasanın kuralına uyar: `2026-04-29 — başlık.uzantı`.

Son on indirilen, yalnızca senin tarayıcında saklanır.  Hiçbir yere
gönderilmez.

### Mimari

GitHub Pages statik siteler barındırır; tarayıcı YouTube’dan doğrudan medya
indiremez (CORS ve YouTube’un bot korumaları).  Bu yüzden uygulama gerçek
çıkarmayı bir aracıya yaptırır: [**cobalt**](https://github.com/imputnet/cobalt).

Cobalt’ın genel sunucusu (`api.cobalt.tools`) artık tarayıcılardan üçüncü taraf
çağrılara kapalı (bot koruması).  Bu yüzden **kendi cobalt’ımızı kuruyoruz** ve
adresini uygulamanın *ayarlar* bölümünden tanıtıyoruz.

### Kendi cobalt sunucunu kurmak (Docker, küçük bir VPS)

1. Bir VPS al (Hetzner, DigitalOcean — aylık birkaç dolar yeter) ve sub-domain
   yönlendir, örn. `cobalt.alaniadin.com`.
2. Docker ile cobalt’ı çalıştır.  Resmi rehber:
   <https://github.com/imputnet/cobalt/blob/main/docs/run-an-instance.md>.
   Kısaca:
   ```bash
   mkdir cobalt && cd cobalt
   curl -O https://raw.githubusercontent.com/imputnet/cobalt/main/docker-compose.example.yml
   mv docker-compose.example.yml docker-compose.yml
   # docker-compose.yml içindeki API_URL ve diğer ayarları kendi sub-domain’ine göre düzenle
   docker compose up -d
   ```
3. Önüne nginx/caddy ile HTTPS ekle.  Caddy en kısa yol:
   ```
   cobalt.alaniadin.com {
     reverse_proxy localhost:9000
   }
   ```
4. Tarayıcı çağrılarına izin vermek için `API_URL` ortam değişkenini
   sub-domain’ine, ve `CORS_URL` ya da `CORS_WILDCARD=1` ayarını cobalt
   konfigine göre düzenle (en güncel anahtar isimleri için yukarıdaki
   resmi rehbere bak).
5. (Opsiyonel) Kötüye kullanımı sınırlamak için bir API anahtarı ayarla.
   Cobalt belgelerinden `keys.json` örneğine göz at; UUID üret, anahtarı sakla.

### Bu uygulamayı bağlamak

1. Siteyi aç: <https://hamzasahin.github.io/download-video/> (deploy
   sonrası).
2. Aşağı in, **ayarlar**’ı aç.
3. *cobalt sunucusu* alanına `https://cobalt.alaniadin.com` yaz.
4. Anahtarın varsa *api anahtarı* alanına yapıştır.
5. **kaydet**.  Adres ve anahtar yalnızca senin tarayıcında saklanır.

### Eğer cobalt bir gün kapanırsa

`app.js` dosyasının başında `cobaltCall` adında küçük bir fonksiyon var.
Sadece o iki yer (gönderilen JSON gövdesi ve cevabı yorumlama) farklı bir API
için yeniden yazılmalı.  Birkaç alternatif:

* Cloudflare Worker üzerinden bir `yt-dlp` proxy (yt-dlp WASM +
  worker-fetch).  Sürekli güncellenen tek-dosya bir worker yazıp `apiBase`
  alanına onun adresini girmek yeter.
* Kendi sunucunda `yt-dlp --print-json` çağıran küçük bir Express/FastAPI
  servisi.  Aynı şekilde adresini *ayarlar*’dan ver.

### Geliştirme

Hiçbir derleme adımı yok.  `index.html`, `styles.css`, `app.js`.  Statik
sunucuyla çalıştır:

```bash
python3 -m http.server 8000
# ardından http://localhost:8000
```

### Yayınlama (GitHub Pages)

`main` dalına push.  Repo’nun *Settings → Pages* bölümünde **GitHub Actions**
seçili olsun.  `.github/workflows/pages.yml` zaten dahili — push’tan sonra
birkaç dakika içinde yayında.

---

## English

### What this is

A small, hand-set web app: paste a YouTube link, pick a purpose-named format
(*for podcast notes*, *for close study*, *quick watch*, *just to listen*),
download.  Filenames come out shaped for Obsidian: `2026-04-29 — title.ext`.

The last ten downloads live only in your browser.  Nothing is sent anywhere.

### Architecture

GitHub Pages serves static files only; browsers cannot extract YouTube media
directly (CORS and anti-scraping).  So the app delegates the real extraction
to [**cobalt**](https://github.com/imputnet/cobalt).

Cobalt’s public host (`api.cobalt.tools`) is now closed to third-party browser
calls (bot protection).  We therefore **self-host cobalt** and tell this app
its address through the *settings* drawer.

### Self-hosting cobalt (Docker on a cheap VPS)

1. Rent a VPS (Hetzner, DigitalOcean — a few dollars a month is plenty), point
   a subdomain at it, e.g. `cobalt.your-domain.com`.
2. Run cobalt with Docker.  Official guide:
   <https://github.com/imputnet/cobalt/blob/main/docs/run-an-instance.md>.
   Roughly:
   ```bash
   mkdir cobalt && cd cobalt
   curl -O https://raw.githubusercontent.com/imputnet/cobalt/main/docker-compose.example.yml
   mv docker-compose.example.yml docker-compose.yml
   # edit API_URL etc. in docker-compose.yml to match your subdomain
   docker compose up -d
   ```
3. Put HTTPS in front (Caddy is the shortest path):
   ```
   cobalt.your-domain.com {
     reverse_proxy localhost:9000
   }
   ```
4. To allow browser calls, set `API_URL` to your subdomain and configure
   `CORS_URL` / `CORS_WILDCARD=1` per the cobalt docs (env names drift; check
   the link above for current spelling).
5. *Optional:* set an API key to keep abuse down.  See cobalt’s `keys.json`
   example; generate a UUID, keep it secret.

### Wiring the app to your instance

1. Open the deployed site:
   <https://hamzasahin.github.io/download-video/>.
2. Scroll to **settings**.
3. Put `https://cobalt.your-domain.com` in *cobalt server*.
4. If you set one, paste the UUID in *api key*.
5. Hit **save**.  Both values stay in this browser only.

### If cobalt ever breaks

There’s a single small function `cobaltCall` near the top of `app.js`.  Only
two things need changing for any drop-in replacement: the request body and the
response interpretation.  Drop-in alternatives:

* A Cloudflare Worker wrapping `yt-dlp` (or `yt-dlp-wasm`).  Write a one-file
  worker, point *cobalt server* at its URL.
* A tiny Express / FastAPI service on the same VPS that calls
  `yt-dlp --print-json`.  Same idea — give it a public URL, point the app at
  it.

### Development

No build step.  Three files: `index.html`, `styles.css`, `app.js`.  Serve
them statically:

```bash
python3 -m http.server 8000
# then http://localhost:8000
```

### Deployment

Push to `main`.  In the repo’s *Settings → Pages*, choose **GitHub Actions**
as source.  The included `.github/workflows/pages.yml` will publish on push.

---

### A note

This was built for one specific person.  See `PERSONALIZATION.md` for every
choice that was made with her in mind.
