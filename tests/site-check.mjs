// Quick safety check for the Passage Planner site. Runs on every change (see .github/workflows/site-check.yml).
// It opens the real page in a phone-sized browser and confirms the core features still work.
import { createRequire } from "node:module"; import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const require = createRequire(process.env.PW_DIR ? path.join(process.env.PW_DIR, "x.js") : import.meta.url);
const { chromium, devices } = require("playwright");
let fails = 0; const check = (ok, what, extra = "") => { console.log((ok ? "PASS " : "FAIL ") + what + (extra ? " — " + extra : "")); if (!ok) fails++; };

for (const f of ["index.html", "manifest.webmanifest", "privacy.html", "sw.js"]) check(fs.existsSync(path.join(root, f)), f + " exists");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
check(html.includes("pro_lifetime"), "paid unlock (pro_lifetime) still in the page — the Play build needs it");
try { JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8")); check(true, "manifest is valid JSON"); } catch (e) { check(false, "manifest is valid JSON", e.message); }

const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const srv = http.createServer((q, r) => { let u = decodeURIComponent(q.url.split("?")[0]); if (u.endsWith("/")) u += "index.html";
  const f = path.join(root, path.normalize(u)); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); }).listen(0);
await new Promise(r => srv.once("listening", r));
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] } : {});
try {
  const p = await (await b.newContext({ ...devices["Pixel 7"], serviceWorkers: "block" })).newPage();
  const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.goto("http://127.0.0.1:" + srv.address().port + "/", { waitUntil: "load" });
  await p.waitForFunction(() => typeof window.searchPorts === "function" && typeof window.mpDist === "function", null, { timeout: 30000 }).catch(() => {});
  check(await p.evaluate(() => typeof window.searchPorts === "function" && typeof window.mpDist === "function"), "port search and distance functions load");
  const r = await p.evaluate(() => { const pick = q => { const l = window.searchPorts(q); return l && l[0] ? (l[0].n ?? l[0]) : null; };
    const A = pick("Longview"), B = pick("Vancouver"), C = pick("Manila"), D = pick("Singapore");
    return { A, B, lv: A && B ? window.mpDist(A, B) : null, ms: C && D ? window.mpDist(C, D) : null }; }).catch(e => ({ err: e.message }));
  check(r.lv > 340 && r.lv < 420, "Longview → Vancouver distance looks right", r.err || (r.lv && r.lv.toFixed(1) + " nm"));
  check(r.ms > 1250 && r.ms < 1450, "Manila → Singapore distance looks right", r.err || (r.ms && r.ms.toFixed(1) + " nm"));
  check(errors.length === 0, "no script errors on load", errors.slice(0, 3).join(" | "));
} finally { await b.close(); srv.close(); }
console.log(fails ? fails + " check(s) failed" : "All site checks passed"); process.exit(fails ? 1 : 0);
