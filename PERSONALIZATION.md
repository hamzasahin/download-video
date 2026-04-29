# Personalization notes

A list of every Neşe-specific choice in this app, so they can be reviewed,
adjusted, or removed.  Everything below is intentional.

---

## 1. Names and addressing

* The page `<title>` is **`atölye — Neşe için`** ("workshop — for Neşe").
* The visible greeting is set in a serif italic and includes her name:
  *"Günaydın, Neşe."* / *"İyi akşamlar, Neşe."* etc., with the period and
  comma kept in a softer ink so the name carries the warmth.
* The greeting is *time-aware* (`app.js → setGreeting`):
  * `00:00–04:59` → İyi geceler / "Late, but here"
  * `05:00–11:59` → Günaydın
  * `12:00–17:59` → İyi öğleden sonralar
  * `18:00–22:59` → İyi akşamlar
  * `23:00–23:59` → İyi geceler
  It also re-checks every five minutes in case the page is left open.

## 2. Language

* Turkish is the default.  Stored in `localStorage` so it sticks.
* A discreet **EN** toggle sits in the top-right of the masthead, set in small
  caps with letter-spacing so it reads as a kicker, not a button.
* Every line of copy in `app.js → COPY` was hand-written; nothing is
  auto-translated. The Turkish is warm and journal-like ("yapıştır, enter’a
  bas. gerisi kendiliğinden olur." rather than "Click to download").

## 3. Aesthetic direction

* Background: **#f7f3ec** — warm off-white, the colour of laid book paper.
* Ink: **#1f1b16** — a deep brown-black, not a pure black.
* Accent: **#b8895a** (faded ochre) — picked over dusty rose and muted teal
  because it pairs photographically with off-white and reads as a film tone
  rather than a UI tint.  Used very sparingly: input underline on focus,
  hover states, the typesetter's mark on the favicon.
* Typography:
  * Headings & body display: **Newsreader** (a contemporary serif with a warm,
    slightly editorial cut) at light weights.
  * Labels & UI: **Inter** at 500, set in **small caps with 0.18em
    letter-spacing**.
* No cards.  No shadows.  No gradients.  No glass.  No icons except the
  sleeping cat and a single typographic "↵" on the input.
* A film-grain SVG overlay sits over the whole page at **0.045 opacity** with
  `mix-blend-mode: multiply`.  Visible only as a very fine paper texture.
* The layout is centered on a 56rem column with generous whitespace;
  greetings, paste field, and stage are separated by hairline rules in
  `--rule: #d9cfbe`.
* Dark mode is supported via `prefers-color-scheme` with a brown-black
  paper (`#18130d`) and a warmer ochre (`#c79a6c`).  No toggle — follows the
  OS, because she'll likely want it after midnight on her phone.
* `prefers-reduced-motion` disables the dot pulse and all transitions.

## 4. Lavinya — the one easter egg

A single placement, tucked in the corner of the idle / empty state:
**a tiny sleeping-cat SVG**, drawn by hand in `index.html` at low opacity
(0.45) in faint ink.  Hovering it warms the line to ochre.

* Her name is the SVG's accessible `<title>Lavinya</title>`, so a
  screen-reader speaks it and a hover-tooltip surfaces it without ever putting
  the name in plain visible text.
* The SVG includes three faint zzz strokes — small enough that they read as a
  printer's mark before they read as sleep.
* I deliberately did **not** use Lavinya's name in the loading copy ("bir
  saniye, hazırlanıyor"), nor as a paw-print on the favicon, even though both
  were tempting.  The brief asked for *one* placement.

## 5. Idle-state fragments

When no URL is pasted, a fragment appears in italic serif, framed in
guillemets (« … »), in `app.js → FRAGMENTS`.  One at a time, picked at random
on load and on language switch.  No author name shown.  Below the fragment
sits a single em-dash button — clicking it reveals the author in italic
ochre; clicking again hides it.

The eleven fragments are short literary motifs drawn from authors she reads:
Heidegger, Edward Said, İbn Arabi, Byung-Chul Han, Cemil Meriç, Sezai
Karakoç, plus one anonymous line on migration that fits the work she is
writing.

> **Editorial note.**  These are *paraphrased fragments in the spirit of*
> their authors, not strict citations.  Most are common Turkish renderings of
> well-known motifs (Heidegger's *Geworfenheit*, Said on exile's threshold,
> İbn Arabi's "heart that takes every form," Han on tiredness).  If you
> would prefer verbatim citations with edition + page numbers, this is the
> file to swap them in.

## 6. Format preset names — by purpose, not codec

In `app.js → PRESETS` and `index.html`:

| Preset      | Turkish                  | English             | Behaviour            |
|-------------|--------------------------|---------------------|----------------------|
| `podcast`   | podcast notları için     | for podcast notes   | audio · mp3          |
| `study`     | yazı çalışması için      | for close study     | video · 1080p        |
| `quick`     | hızlı izleme             | quick watch         | video · 720p         |
| `listen`    | sadece dinlemek için     | just to listen      | audio · opus (small) |

Named by *purpose* because she's planning a podcast on memory and migration
and currently writing on *Geworfenheit* — the labels are written for those
two activities.

## 7. Filenames for her Obsidian vault

`obsidianFilename()` produces `YYYY-MM-DD — sanitized-title.ext`, with an
em-dash spacer (the same em-dash convention many Obsidian vaults use for
zettel naming).  Sanitization:

* Strips `\ / : * ? " < > |`.
* Collapses runs of whitespace and hyphens.
* Trims to 80 characters (long enough for memory; short enough that it
  doesn't spill in the file pane).

A **kopyala** ("copy") button next to the filename writes it to the clipboard
in one tap.  Recent-downloads list also shows the same kopyala on each row.

## 8. Recent downloads — local-only

`localStorage` key `atolye.recent`, capped at the last 10 entries.  Deduped
by filename.  Times shown as relative ("3 dk", "2 sa", "1 gün").  A
**listeyi temizle** button clears it.  Nothing is synced; nothing is sent.

## 9. Errors written like a letter

In `app.js → COPY`:

* `errInvalid`: *"Bu bağlantı bana pek youtube gibi gelmedi — bir kez daha
  bakalım mı?"*
* `errNoServer`: *"Sunucu henüz ayarlı değil. Aşağıdaki ayarlar bölümünden
  bir cobalt adresi ekle."*
* `errNetwork`: *"Sunucuya ulaşılamadı. Bağlantın açıkken biraz sonra tekrar
  dener misin?"*
* `errAuth`: *"Sunucu bir api anahtarı istiyor. Ayarlar bölümünden
  ekleyebilir misin?"*
* `errPicker`: *"Bu bağlantı birden fazla parça içeriyor — şimdilik tek
  videolu bağlantılarla daha rahatım."*
* `errGeneric`: *"Bu video şu an alınamadı, biraz sonra tekrar dener misin?"*

No error codes shown.  No technical jargon.  The voice is the same
throughout.

## 10. Keyboard-friendly

`<input type="url">` + form submit; **paste + Enter** does the whole thing.
The submit affordance is a single typographic *↵* in serif, which moves
2px on hover.

## 11. Mobile-first

Everything tested at 375px wide first, then scaled up.  At ≤480px the
filename row breaks into a column, the language toggle moves up, and the
sleeping cat shrinks.  Type uses `clamp()` so headings shrink continuously
rather than at breakpoints.

## 12. The masthead micro-typography

* The kicker reads *"bir indirme atölyesi"* — *atölye* (workshop), not *uygulama*.
* The greeting punctuation sits in `--ink-faint` so the name reads first.
* The colophon at the bottom reads *"elle dizilmiştir · 2026"* — *set by hand*,
  the way a small magazine signs off.

## 13. Settings UX

The settings drawer is closed by default.  The summary uses a custom **+** /
**−** in ochre instead of the disclosure triangle.  When she saves, a small
italic *kaydedildi* fades in for 1.6s in ochre — no green check, no toast.

## 14. Favicon

A single typeset italic serif **n** with a small ochre **·** above-right —
reads as the start of *neşe* set in a magazine, not as a logo.  Drawn by
hand in SVG so it stays sharp on every screen.  (No paw print here; that
would be a second Lavinya placement.)

---

## What I deliberately left out

* **No analytics.**  Not even self-hosted.
* **No PWA installer prompt.**  She can install from the browser menu if
  she wants; nothing should ask.
* **No share button, no tweet button, no telemetry.**
* **No sign-in, no accounts.**
* **No light/dark toggle.**  Follows the OS.
* **No success "✓" animations.**  The only acknowledgements are the small
  italic *kopyalandı* / *kaydedildi* lines.

---

## Things easy to adjust

| Want to change…           | Edit…                                     |
|---------------------------|-------------------------------------------|
| Accent colour             | `:root --accent` and `--accent-deep` in `styles.css` |
| Heading typeface          | `:root --serif` and the `<link>` in `index.html` |
| The fragments             | `FRAGMENTS` array in `app.js`              |
| Format preset names       | `data-i18n="presetXxx"` keys in `index.html` and `COPY` in `app.js` |
| Filename pattern          | `obsidianFilename()` in `app.js`           |
| Greeting bands by hour    | `setGreeting()` in `app.js`                |
| Where Lavinya hides       | `tpl-idle` `<svg class="lavinya">` in `index.html` |
