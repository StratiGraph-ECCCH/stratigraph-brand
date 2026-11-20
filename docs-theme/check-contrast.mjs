#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════
   Il contrasto dei manuali, misurato e non guardato.

   Apre in Chromium alcune pagine di un manuale già costruito (sphinx-build
   -b html), una volta in chiaro e una in scuro (la scelta che farebbe
   l'interruttore: localStorage "sg-theme", più prefers-color-scheme), e per
   ogni elemento che porta testo proprio misura il rapporto WCAG fra il colore
   del testo e il fondo che ha davvero sotto (risalendo gli antenati e
   componendo i fondi semitrasparenti). Fallisce se un elemento sta sotto la
   soglia: 4.5:1 per il testo normale, 3:1 per quello grande (WCAG 1.4.3).

     node check-contrast.mjs <cartella-html> <pagina.html> [<pagina.html> …]

   Ambiente:
     PLAYWRIGHT_CORE  percorso di playwright-core/index.js (se non è
                      risolvibile da qui: il marchio non ha node_modules)
     SHOTS            cartella dove lasciare uno screenshot per pagina e tema
     THEMES           "light,dark" (predefinito)
     MIN              soglia del testo normale (4.5)
     SKIN             la pelle da misurare (data-sg-skin su <html>): in un
                      manuale EM, che porta skins.css, "stratigraph" misura
                      la faccia StratiGraph, "em-cool" l'altra pelle EM;
                      senza, la pelle che il manuale mostra da sé

   La faccia StratiGraph in chiaro (MICRO-SEG06, 20 nov 2026): link 2,98 →
   5,74, testata della barra 3,53 → 6,80 (versione 3,00 → 6,80), `code`
   3,94 → 4,52 (il `code` dentro un link 2,35 → 4,53), con l'arancio e la terracotta della guida scuriti quanto basta
   (stratigraph-theme.css, --sg-burnt-orange-ink e --sg-terracotta-ink).

   Gruppi misurati: barra laterale (anche la sezione aperta e la voce
   corrente), testata della barra, link del testo, tasti <kbd>, codice in riga
   e blocchi (anche i colori di Pygments), tabelle, ammonizioni, testo,
   briciole, piede e provenienza, didascalie. Il riquadro di Read the Docs
   (versione/lingua) non c'è in una build locale: lo disegna lo script di Read
   the Docs nel suo shadow DOM, con colori suoi.
   ══════════════════════════════════════════════════════════════════════════ */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  const p = process.env.PLAYWRIGHT_CORE;
  if (p) return require(p);
  try { return require("playwright-core"); } catch (e) {
    console.error("playwright-core non trovato: PLAYWRIGHT_CORE=/…/playwright-core/index.js");
    process.exit(2);
  }
}

const [root0, ...pages] = process.argv.slice(2);
const root = root0 ? path.resolve(root0) : "";
if (!root || !pages.length) {
  console.error("uso: check-contrast.mjs <cartella-html> <pagina.html> [...]");
  process.exit(2);
}
const THEMES = (process.env.THEMES || "light,dark").split(",");
const MIN = Number(process.env.MIN || 4.5);
const SHOTS = process.env.SHOTS || "";
const SKIN = process.env.SKIN || "";

const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".woff2": "font/woff2", ".json": "application/json", ".gif": "image/gif",
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let f = path.join(root, rel);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/`;

const GROUPS = {
  sidebar: ".wy-menu-vertical a, .wy-menu-vertical p.caption, .wy-menu-vertical span, .wy-menu-vertical code",
  "sidebar-head": ".wy-side-nav-search > a, .wy-side-nav-search .version, .sg-theme-toggle span",
  link: ".rst-content a:not(.headerlink)",
  kbd: "kbd",
  code: ".rst-content code, .rst-content code span, .rst-content pre, .rst-content pre span",
  table: ".rst-content table th, .rst-content table td, .rst-content table td p, .rst-content table th p",
  admonition: ".rst-content .admonition, .rst-content .admonition p, .rst-content .admonition-title, .rst-content .admonition li",
  text: ".rst-content p, .rst-content li, .rst-content h1, .rst-content h2, .rst-content h3, .rst-content h4, .rst-content dt, .rst-content dd, .rst-content em, .rst-content strong",
  breadcrumbs: ".wy-breadcrumbs, .wy-breadcrumbs li, .wy-breadcrumbs a",
  footer: "footer p, footer a, footer div, .sg-provenance p, .sg-provenance a, .sg-provenance strong",
  caption: "figcaption, figcaption p, .caption-text",
};

function measure(groups) {
  function rgba(s) {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function over(top, under) {
    const a = top.a + under.a * (1 - top.a);
    if (!a) return { r: 0, g: 0, b: 0, a: 0 };
    const mix = (k) => (top[k] * top.a + under[k] * under.a * (1 - top.a)) / a;
    return { r: mix("r"), g: mix("g"), b: mix("b"), a };
  }
  function lum(c) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function ratio(a, b) {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  }
  function background(el) {
    const layers = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !/url\(/.test(cs.backgroundImage)) {
        return { unknown: true };
      }
      const c = rgba(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc);
    return acc;
  }
  function ownText(el) {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return n.textContent.trim();
    return "";
  }
  function visible(el) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) === 0) return false;
    }
    return true;
  }
  const out = [];
  for (const [group, sel] of Object.entries(groups)) {
    const seen = new Set();
    for (const el of document.querySelectorAll(sel)) {
      if (seen.has(el)) continue;
      seen.add(el);
      const text = ownText(el);
      if (!text || !visible(el)) continue;
      const cs = getComputedStyle(el);
      const fg0 = rgba(cs.color);
      const bg = background(el);
      if (!fg0 || bg.unknown) continue;
      const fg = over(fg0, bg);
      const size = parseFloat(cs.fontSize);
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
      out.push({
        group, text: text.slice(0, 40), ratio: Math.round(ratio(fg, bg) * 100) / 100, large,
        fg: cs.color, bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        cls: (el.tagName + "." + [...el.classList].join(".")).slice(0, 60),
      });
    }
  }
  return out;
}

const { chromium } = loadPlaywright();
const browser = await chromium.launch();
let failures = 0;
const summary = [];
try {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: theme });
    await ctx.addInitScript((t) => { try { localStorage.setItem("sg-theme", t); } catch (e) {} }, theme);
    if (SKIN) {
      await ctx.addInitScript((k) => {
        const put = () => document.documentElement && document.documentElement.setAttribute("data-sg-skin", k);
        put();
        document.addEventListener("DOMContentLoaded", put);
      }, SKIN);
    }
    const page = await ctx.newPage();
    for (const p of pages) {
      const resp = await page.goto(base + p.replace(/^\//, ""), { waitUntil: "load" });
      if (!resp || !resp.ok()) { console.log(`✗ ${theme} ${p}: pagina non trovata`); failures++; continue; }
      await page.evaluate(() => document.fonts && document.fonts.ready);
      const rows = await page.evaluate(measure, GROUPS);
      if (!rows.length) { console.log(`✗ ${theme} ${p}: nessun elemento misurato`); failures++; continue; }
      if (SHOTS) {
        fs.mkdirSync(SHOTS, { recursive: true });
        await page.screenshot({ path: path.join(SHOTS, `${p.replace(/[\/.]/g, "_")}-${theme}.png`) });
      }
      const byGroup = {};
      for (const r of rows) {
        const need = r.large ? 3 : MIN;
        const g = (byGroup[r.group] ||= { n: 0, worst: null, bad: [] });
        g.n++;
        if (!g.worst || r.ratio < g.worst.ratio) g.worst = r;
        if (r.ratio < need) g.bad.push(r);
      }
      for (const [group, g] of Object.entries(byGroup)) {
        const ok = !g.bad.length;
        if (!ok) failures += g.bad.length;
        summary.push({ theme, page: p, group, n: g.n, worst: g.worst.ratio, bad: g.bad.length });
        const w = g.worst;
        console.log(`${ok ? "✓" : "✗"} ${(SKIN ? SKIN + "/" : "") + theme.padEnd(5)} ${p.padEnd(46)} ${group.padEnd(12)} n=${String(g.n).padEnd(4)} min ${w.ratio.toFixed(2)}`
          + (ok ? "" : `  ${g.bad.length} sotto soglia, es. «${g.bad[0].text}» ${g.bad[0].cls} ${g.bad[0].fg} su ${g.bad[0].bg} = ${g.bad[0].ratio}`));
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (process.env.JSON_OUT) fs.writeFileSync(process.env.JSON_OUT, JSON.stringify(summary, null, 1));
console.log(failures ? `\n✗ ${failures} elementi sotto soglia` : "\n✓ tutto sopra soglia");
process.exit(failures ? 1 : 0);
