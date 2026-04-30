// atölye — for Neşe.
// vanilla module. zero runtime deps.

// The deployed Cloudflare Worker proxy. The Worker holds the cobalt
// API key as a secret and pins the allowed Origin, so the browser
// never sees a key. Set this once after deploying the Worker (see
// /cloudflare-worker/README.md). Leave empty to fall back to the
// per-user override flow in the settings drawer.
const DEFAULT_API_BASE = "";

const STORAGE = {
  lang: "atolye.lang",
  apiBase: "atolye.apiBase",
  recent: "atolye.recent",
};

// ── i18n ─────────────────────────────────────────────────
const COPY = {
  tr: {
    kicker: "bir indirme atölyesi",
    pasteLabel: "bağlantı",
    pastePlaceholder: "bir youtube bağlantısı yapıştır…",
    hint: "yapıştır, enter’a bas. gerisi kendiliğinden olur.",
    recentLabel: "son indirilenler",
    clearRecent: "listeyi temizle",
    settingsLabel: "ayarlar",
    settingsIntro:
      "Sunucu zaten ayarlı; bu kapı yalnızca işler ters giderse açılmak için. " +
      "Kendi cobalt veya proxy adresini girersen onun üzerinden çalışır.",
    apiBaseLabel: "sunucu adresi",
    save: "kaydet",
    settingsHelp:
      "Adres yalnızca bu cihazda, tarayıcıda saklanır. Hiçbir yere gönderilmez.",
    saved: "kaydedildi.",
    colophon: "elle dizilmiştir · 2026",
    filenameLabel: "dosya adı",
    copyFilename: "kopyala",
    copied: "kopyalandı",
    formatLabel: "biçim",
    presetPodcast: "podcast notları için",
    presetPodcastDetail: "ses · mp3",
    presetStudy: "yazı çalışması için",
    presetStudyDetail: "video · 1080p",
    presetQuick: "hızlı izleme",
    presetQuickDetail: "video · 720p",
    presetListen: "sadece dinlemek için",
    presetListenDetail: "ses · küçük",
    working: "bir saniye, hazırlanıyor",
    greetMorning: "Günaydın",
    greetAfternoon: "İyi öğleden sonralar",
    greetEvening: "İyi akşamlar",
    greetNight: "İyi geceler",
    errInvalid: "Bu bağlantı bana pek youtube gibi gelmedi — bir kez daha bakalım mı?",
    errNoServer:
      "Sunucu henüz ayarlı değil. Aşağıdaki <em>ayarlar</em> bölümünden bir cobalt adresi ekle.",
    errNetwork:
      "Sunucuya ulaşılamadı. Bağlantın açıkken biraz sonra tekrar dener misin?",
    errGeneric:
      "Bu video şu an alınamadı, biraz sonra tekrar dener misin?",
    errAuth:
      "Sunucu bir api anahtarı istiyor. Ayarlar bölümünden ekleyebilir misin?",
    errPicker:
      "Bu bağlantı birden fazla parça içeriyor — şimdilik tek videolu bağlantılarla daha rahatım.",
    firstRunHint:
      "Sunucu henüz ayarlanmamış. <code>app.js</code> içine <code>DEFAULT_API_BASE</code> ekleyin ya da aşağıdaki <em>ayarlar</em> bölümünden bir adres girin.",
    ariaLangToggle: "Dili değiştir",
    ariaSubmit: "Devam et",
    ariaFragmentAttr: "kim yazmıştı?",
    ariaCopyFilename: "dosya adını kopyala",
    apiBasePlaceholder: "https://cobalt.kendi-sunucum.com",
  },
  en: {
    kicker: "a quiet downloads workshop",
    pasteLabel: "link",
    pastePlaceholder: "paste a youtube link…",
    hint: "paste, hit enter. the rest takes care of itself.",
    recentLabel: "recently downloaded",
    clearRecent: "clear list",
    settingsLabel: "settings",
    settingsIntro:
      "The server is already wired up; this drawer is only here as a fallback " +
      "if something breaks. Enter your own cobalt or proxy URL to override.",
    apiBaseLabel: "server address",
    save: "save",
    settingsHelp:
      "The address lives only in this browser. Nothing is sent anywhere else.",
    saved: "saved.",
    colophon: "set by hand · 2026",
    filenameLabel: "filename",
    copyFilename: "copy",
    copied: "copied",
    formatLabel: "format",
    presetPodcast: "for podcast notes",
    presetPodcastDetail: "audio · mp3",
    presetStudy: "for close study",
    presetStudyDetail: "video · 1080p",
    presetQuick: "quick watch",
    presetQuickDetail: "video · 720p",
    presetListen: "just to listen",
    presetListenDetail: "audio · small",
    working: "one moment, preparing",
    greetMorning: "Good morning",
    greetAfternoon: "Good afternoon",
    greetEvening: "Good evening",
    greetNight: "Late, but here",
    errInvalid: "That link doesn’t look quite like youtube — try once more?",
    errNoServer:
      "No server set yet. Open <em>settings</em> below and add a cobalt address.",
    errNetwork: "Couldn’t reach the server. Mind trying again in a moment?",
    errGeneric: "Couldn’t fetch that one. Try again in a bit?",
    errAuth: "The server wants an api key. Could you add it in settings?",
    errPicker:
      "This link contains several pieces — for now I’m gentler with single videos.",
    firstRunHint:
      "No server is set yet. Edit <code>DEFAULT_API_BASE</code> in <code>app.js</code>, or paste a URL into <em>settings</em> below.",
    ariaLangToggle: "Switch language",
    ariaSubmit: "Continue",
    ariaFragmentAttr: "who wrote that?",
    ariaCopyFilename: "copy filename",
    apiBasePlaceholder: "https://cobalt.your-domain.com",
  },
};

// ── fragments (idle state) ───────────────────────────────
// Short literary motifs — drawn from authors Neşe reads.
// These are paraphrased fragments in their spirit, not strict citations;
// see PERSONALIZATION.md for the editorial note.
const FRAGMENTS = [
  { tr: "Geworfenheit. Hep bir yere doğru fırlatılmış olmak.", en: "Geworfenheit. To have always been thrown — toward somewhere.", who: "Heidegger" },
  { tr: "Dasein, dünyanın içine sürüklenmiştir.", en: "Dasein finds itself drawn into the world.", who: "Heidegger" },
  { tr: "Sürgün, hayalle gerçeğin arasındaki kıyıda yaşamaktır.", en: "Exile is to live on the shore between imagined and real.", who: "Edward Said" },
  { tr: "Hiçbir yer artık yalnızca bir yer değildir.", en: "No place is any longer only a place.", who: "Edward Said" },
  { tr: "Kalbim, her surete giren bir aynadır.", en: "My heart has become a mirror open to every form.", who: "İbn Arabi" },
  { tr: "Aşk, dinim ve imanım olmuştur.", en: "Love has become my faith, my creed.", who: "İbn Arabi" },
  { tr: "Yorgunluk, bir arada olmanın sessiz biçimidir.", en: "Tiredness is a quiet way of being together.", who: "Byung-Chul Han" },
  { tr: "Şeffaflık, anlamın değil bilginin diktatörlüğüdür.", en: "Transparency is the dictatorship not of meaning, but of information.", who: "Byung-Chul Han" },
  { tr: "Kütüphane, hafızanın mabedidir.", en: "A library is the temple of memory.", who: "Cemil Meriç" },
  { tr: "Hatırlamak, var olmanın başka bir adıdır.", en: "To remember is another name for being.", who: "Sezai Karakoç" },
  { tr: "Göç, bir dilden başka bir sessizliğe geçiştir.", en: "Migration is a passage from one language into another silence.", who: "—" },
];

// ── helpers ──────────────────────────────────────────────
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const isYouTubeUrl = (s) => {
  try {
    const u = new URL(s.trim());
    return /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com|music\.youtube\.com)$/i.test(u.hostname);
  } catch {
    return false;
  }
};

const ytId = (s) => {
  try {
    const u = new URL(s.trim());
    if (/youtu\.be$/i.test(u.hostname)) return u.pathname.slice(1).split("/")[0] || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/(?:embed|shorts|live)\/([^/?#]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
};

const sanitize = (s) =>
  (s || "video")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/[ -]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

const today = () => {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};

const obsidianFilename = (title, ext) => `${today()} — ${sanitize(title)}.${ext}`;

const fmtDuration = (sec) => {
  if (!sec || !isFinite(sec)) return "";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${m}:${String(ss).padStart(2, "0")}`;
};

// ── language ─────────────────────────────────────────────
let LANG = localStorage.getItem(STORAGE.lang) || "tr";
const t = (k) => COPY[LANG][k] ?? COPY.tr[k] ?? k;

function applyI18n(root = document) {
  $$("[data-i18n]", root).forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = t(key);
  });
  $$("[data-i18n-attr]", root).forEach((el) => {
    el.getAttribute("data-i18n-attr").split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
  document.documentElement.lang = LANG;
  $("#langToggle").textContent = LANG === "tr" ? "EN" : "TR";
}

function setLang(next) {
  LANG = next;
  localStorage.setItem(STORAGE.lang, LANG);
  applyI18n();
  setGreeting();
  // Re-render only the stage view that's currently up — don't clobber
  // a preview the user is working with.
  if (STAGE.kind === "idle") renderIdle();
  else if (STAGE.kind === "preview" && CURRENT) renderPreview(CURRENT.url, CURRENT.meta);
  else if (STAGE.kind === "error") renderError(STAGE.msgKey, STAGE.customHTML);
  // 'working' has no language-specific text beyond data-i18n which
  // applyI18n has already updated.
  renderRecent();
}

// ── time-aware greeting ──────────────────────────────────
function setGreeting() {
  const h = new Date().getHours();
  let key;
  if (h < 5) key = "greetNight";
  else if (h < 12) key = "greetMorning";
  else if (h < 18) key = "greetAfternoon";
  else if (h < 23) key = "greetEvening";
  else key = "greetNight";
  $("#greeting").textContent = t(key);
}

// ── stage helpers ────────────────────────────────────────
const stage = $("#stage");

// Tracks what's currently rendered in the stage so language switches
// don't blow away an in-progress preview or error.
let STAGE = { kind: "idle" };

function clearStage() {
  stage.innerHTML = "";
}

function fromTpl(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function renderIdle() {
  clearStage();

  // If no cobalt server is configured yet, lay a soft hint above the
  // literary fragment so she knows where to look. Persists across
  // re-renders (language toggle, page reload) until she saves a server.
  if (!getServer().base) {
    const hint = document.createElement("p");
    hint.className = "first-run-hint";
    hint.setAttribute("data-i18n", "firstRunHint");
    hint.innerHTML = t("firstRunHint");
    stage.appendChild(hint);
  }

  const node = fromTpl("tpl-idle");
  const frag = FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)];
  node.querySelector(".fragment-text").textContent = frag[LANG] || frag.tr;
  const attrBtn = node.querySelector(".fragment-attr");
  const cite = node.querySelector(".fragment-author");
  cite.textContent = frag.who;
  attrBtn.addEventListener("click", () => {
    const open = !cite.hidden;
    cite.hidden = open;
    attrBtn.textContent = open ? "—" : "·";
  });
  stage.appendChild(node);
  applyI18n(stage);
  STAGE = { kind: "idle" };
}

function renderWorking() {
  clearStage();
  stage.appendChild(fromTpl("tpl-working"));
  applyI18n(stage);
  STAGE = { kind: "working" };
}

function renderError(msgKey, customHTML) {
  clearStage();
  const node = fromTpl("tpl-error");
  const p = node.querySelector(".error");
  p.innerHTML = customHTML || t(msgKey);
  stage.appendChild(node);
  STAGE = { kind: "error", msgKey, customHTML };
}

// ── cobalt API ───────────────────────────────────────────
function getServer() {
  // Override (set via settings drawer) wins over the baked default.
  const override = localStorage.getItem(STORAGE.apiBase) || "";
  const base = (override || DEFAULT_API_BASE).replace(/\/+$/, "");
  return { base };
}

async function cobaltCall(url, options) {
  const { base } = getServer();
  if (!base) {
    const err = new Error("no-server");
    err.kind = "no-server";
    throw err;
  }
  // No Authorization header from the browser — when we go through the
  // Worker proxy the key is added server-side. If the user has
  // overridden apiBase to point straight at a key-protected cobalt,
  // they can deploy their own Worker, or run cobalt without keys.
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  let res;
  try {
    res = await fetch(base + "/", {
      method: "POST",
      headers,
      body: JSON.stringify({ url, ...options }),
      mode: "cors",
    });
  } catch (e) {
    const err = new Error("network");
    err.kind = "network";
    throw err;
  }

  let data;
  try { data = await res.json(); } catch {
    const err = new Error("network");
    err.kind = "network";
    throw err;
  }

  if (data?.status === "error") {
    const code = data?.error?.code || "";
    const err = new Error(code);
    err.kind = /api\.auth\./.test(code) ? "auth" : "api";
    err.code = code;
    throw err;
  }
  return data;
}

const PRESETS = {
  podcast: { downloadMode: "audio", audioFormat: "mp3", audioBitrate: "192", filenameStyle: "basic", ext: "mp3" },
  study:   { downloadMode: "auto",  videoQuality: "1080", filenameStyle: "basic", ext: "mp4" },
  quick:   { downloadMode: "auto",  videoQuality: "720",  filenameStyle: "basic", ext: "mp4" },
  // mp3 (not opus) so it plays everywhere — iOS Files preview, Apple
  // Music, an old laptop, anything she might AirDrop it onto.
  listen:  { downloadMode: "audio", audioFormat: "mp3", audioBitrate: "64",  filenameStyle: "basic", ext: "mp3" },
};

// ── metadata via youtube oEmbed (no key, CORS-friendly) ──
async function fetchMeta(url) {
  const id = ytId(url);
  if (!id) return null;
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    "https://www.youtube.com/watch?v=" + id
  )}&format=json`;
  try {
    const res = await fetch(oembed, { mode: "cors" });
    if (!res.ok) throw new Error("oembed");
    const data = await res.json();
    return {
      id,
      title: data.title || "",
      channel: data.author_name || "",
      thumbnail:
        data.thumbnail_url ||
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: null, // oEmbed doesn’t provide duration; left blank
    };
  } catch {
    return {
      id,
      title: "",
      channel: "",
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: null,
    };
  }
}

// ── preview view ─────────────────────────────────────────
let CURRENT = null; // {url, meta}

function renderPreview(url, meta) {
  CURRENT = { url, meta };
  clearStage();
  const node = fromTpl("tpl-preview");

  node.querySelector(".thumb").src = meta.thumbnail;
  node.querySelector(".thumb").alt = meta.title || "video";
  const dur = node.querySelector(".duration");
  if (meta.duration) dur.textContent = fmtDuration(meta.duration);
  else dur.remove();
  node.querySelector(".channel").textContent = meta.channel || "";
  node.querySelector(".title").textContent = meta.title || url;

  // default filename = study preset (mp4)
  const filenameEl = node.querySelector(".filename");
  filenameEl.textContent = obsidianFilename(meta.title, "mp4");

  const copyBtn = node.querySelector(".copy-btn");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(filenameEl.textContent);
      copyBtn.textContent = t("copied");
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = t("copyFilename");
        copyBtn.classList.remove("copied");
      }, 1600);
    } catch {}
  });

  $$(".preset", node).forEach((btn) => {
    btn.addEventListener("click", () => onPreset(btn, filenameEl));
  });

  stage.appendChild(node);
  applyI18n(stage);
  STAGE = { kind: "preview" };
}

async function onPreset(btn, filenameEl) {
  if (!CURRENT) return;
  const presetKey = btn.dataset.preset;
  const preset = PRESETS[presetKey];
  const fname = obsidianFilename(CURRENT.meta.title, preset.ext);
  filenameEl.textContent = fname;

  const allBtns = $$(".preset");
  allBtns.forEach((b) => (b.disabled = true));
  const original = btn.querySelector(".preset-name").textContent;
  btn.querySelector(".preset-name").textContent = t("working");

  try {
    const data = await cobaltCall(CURRENT.url, {
      downloadMode: preset.downloadMode,
      audioFormat: preset.audioFormat,
      audioBitrate: preset.audioBitrate,
      videoQuality: preset.videoQuality,
      filenameStyle: "basic",
    });

    if (data.status === "tunnel" || data.status === "redirect") {
      triggerDownload(data.url, fname);
      addRecent({
        title: CURRENT.meta.title || CURRENT.url,
        filename: fname,
        ts: Date.now(),
      });
    } else if (data.status === "picker") {
      renderError("errPicker");
    } else {
      renderError("errGeneric");
    }
  } catch (e) {
    if (e.kind === "no-server") renderError("errNoServer");
    else if (e.kind === "auth") renderError("errAuth");
    else if (e.kind === "network") renderError("errNetwork");
    else renderError("errGeneric");
  } finally {
    allBtns.forEach((b) => (b.disabled = false));
    btn.querySelector(".preset-name").textContent = original;
  }
}

function triggerDownload(href, filename) {
  // For tunnel/redirect URLs, navigate via a temporary anchor.
  // Some providers ignore the download attribute (cross-origin); the
  // suggested filename then comes from Content-Disposition. The user
  // still has the copyable filename above for Obsidian filing.
  const a = document.createElement("a");
  a.href = href;
  a.rel = "noopener";
  a.download = filename;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ── recent downloads ─────────────────────────────────────
function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.recent) || "[]");
  } catch {
    return [];
  }
}

function addRecent(entry) {
  const list = getRecent();
  // dedupe by filename
  const filtered = list.filter((x) => x.filename !== entry.filename);
  filtered.unshift(entry);
  const trimmed = filtered.slice(0, 10);
  localStorage.setItem(STORAGE.recent, JSON.stringify(trimmed));
  renderRecent();
}

function clearRecent() {
  localStorage.removeItem(STORAGE.recent);
  renderRecent();
}

function renderRecent() {
  const list = getRecent();
  const wrap = $("#recent");
  const ul = $("#recentList");
  ul.innerHTML = "";
  if (!list.length) {
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  list.forEach((entry) => {
    const li = document.createElement("li");
    const title = document.createElement("span");
    title.className = "r-title";
    title.textContent = entry.filename;
    title.title = entry.title;
    const meta = document.createElement("span");
    meta.className = "r-meta";
    meta.textContent = relTime(entry.ts);
    const copy = document.createElement("button");
    copy.className = "r-copy";
    copy.type = "button";
    copy.textContent = t("copyFilename");
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(entry.filename);
        copy.textContent = t("copied");
        setTimeout(() => (copy.textContent = t("copyFilename")), 1600);
      } catch {}
    });
    li.append(title, meta, copy);
    ul.appendChild(li);
  });
}

function relTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return LANG === "tr" ? "az önce" : "just now";
  if (m < 60) return LANG === "tr" ? `${m} dk` : `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return LANG === "tr" ? `${h} sa` : `${h}h`;
  const d = Math.round(h / 24);
  return LANG === "tr" ? `${d} gün` : `${d}d`;
}

// ── settings ─────────────────────────────────────────────
function loadSettingsForm() {
  $("#apiBase").value = localStorage.getItem(STORAGE.apiBase) || "";
}

function saveSettings() {
  const base = $("#apiBase").value.trim().replace(/\/+$/, "");
  if (base) localStorage.setItem(STORAGE.apiBase, base);
  else localStorage.removeItem(STORAGE.apiBase);
  const status = $("#settingsStatus");
  status.textContent = t("saved");
  status.classList.add("visible");
  setTimeout(() => status.classList.remove("visible"), 1600);

  // If the configured-state changed while idle, refresh the hint.
  if (STAGE.kind === "idle") renderIdle();
}

// ── flow ─────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  const url = $("#url").value.trim();
  if (!url) return;
  if (!isYouTubeUrl(url)) {
    renderError("errInvalid");
    return;
  }
  renderWorking();
  const meta = await fetchMeta(url);
  if (!meta) {
    renderError("errInvalid");
    return;
  }
  renderPreview(url, meta);
}

// ── boot ─────────────────────────────────────────────────
function boot() {
  applyI18n();
  setGreeting();
  loadSettingsForm();

  // First-run safety net: if neither the baked DEFAULT_API_BASE nor
  // an override is set, open the settings drawer so the dev who is
  // bringing this up sees where to put the URL. With DEFAULT_API_BASE
  // configured (the deployed-for-Neşe path), this never triggers.
  if (!getServer().base) $(".settings").open = true;

  renderIdle();
  renderRecent();

  $("#urlForm").addEventListener("submit", handleSubmit);
  $("#langToggle").addEventListener("click", () => setLang(LANG === "tr" ? "en" : "tr"));
  $("#saveSettings").addEventListener("click", saveSettings);
  $("#clearRecent").addEventListener("click", clearRecent);

  // tick the greeting and the relative-time labels in the recent list
  setInterval(() => {
    setGreeting();
    renderRecent();
  }, 5 * 60 * 1000);
}

boot();
