// Builds navwarn.json: NAVAREA warnings in force for all 21 NAVAREAs (plus coastal regions when available).
// Source: SeaLagom free plain-text feeds (www.sealagom.com), which collect the NAVAREA coordinators' broadcasts.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
const UA = 'PassagePlanner-navwarn/1.0 (+https://navigator-isle.github.io)';
const HEAD = /^(.+?\S)\s{2,}(\d{4}-\d\d-\d\d \d\d:\d\d) UTC\s*$/;
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(45000) }); if (r.ok) return r; console.log(url, 'HTTP', r.status); }
    catch (e) { console.log(url, e.message); }
    await new Promise(r => setTimeout(r, 4000 * (i + 1)));
  }
  return null;
}
function parse(txt, area) {
  const out = []; let cur = null;
  for (const line of txt.replace(/\r/g, '').split('\n').slice(1)) {
    const m = line.match(HEAD);
    if (m && /\d/.test(m[1]) && m[1].length < 80) { if (cur) out.push(cur); cur = { id: m[1].replace(/\s+/g, ' '), a: area, d: m[2].replace(' ', 'T') + 'Z', t: [] }; continue; }
    if (cur) cur.t.push(line);
  }
  if (cur) out.push(cur);
  return out.map(w => ({ ...w, t: w.t.join('\n').trim() })).filter(w => w.t);
}
const res = { fetched: new Date().toISOString(), source: 'SeaLagom, www.sealagom.com – collected from the NAVAREA coordinators and coastal authorities', areas: {}, w: [] };
for (let n = 1; n <= 21; n++) {
  const area = 'NAVAREA ' + ROMAN[n];
  const r = await get(`https://www.sealagom.com/feeds/warnings.txt?navarea=${n}&limit=500`);
  if (!r) { res.areas[area] = { ok: false }; continue; }
  if (n === 11) console.log('CORS header:', r.headers.get('access-control-allow-origin'));
  const L = parse(await r.text(), area);
  res.areas[area] = { ok: true, n: L.length }; res.w.push(...L);
}
// coastal regions (if the public list is available without a key)
try {
  const r = await get('https://www.sealagom.com/api/v2/coastal/', 1);
  if (r) {
    let j = await r.json(); const regs = [...(j.results || [])];
    for (let k = 0; k < 20 && j.next; k++) { const rn = await get(j.next, 2); if (!rn) break; j = await rn.json(); regs.push(...(j.results || [])); }
    console.log('coastal regions:', regs.length, regs.map(g => g.title || g.name).join(', '));
    for (const g of regs) {
      const nm = 'Coastal ' + (g.country || g.title || g.name || g.id);
      const rr = await get(`https://www.sealagom.com/feeds/warnings.txt?coastal=${encodeURIComponent(g.id)}&limit=500`, 2);
      if (!rr) continue; const L = parse(await rr.text(), nm).map(w => ({ ...w, id: w.id.replace(/^(.+?) Coastal \1 /, '$1 ') })); if (L.length) { const o = res.areas[nm] || { ok: true, n: 0, c: g.country || '' }; o.n += L.length; res.areas[nm] = o; res.w.push(...L); }
    }
  }
} catch (e) { console.log('coastal:', e.message); }
const okAreas = Object.values(res.areas).filter(a => a.ok).length;
console.log('areas ok', okAreas, 'warnings', res.w.length);
if (okAreas < 10) { console.log('Too few areas – keeping the previous file'); process.exit(0); }
// ---- write one small file per area plus an index with each area's extent, so the app downloads only what is near the route
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
const POS = /(\d{1,2})-(\d{1,2}(?:\.\d+)?)(?:-(\d{1,2}(?:\.\d+)?))?\s*([NS])[\s,\/]*(\d{1,3})-(\d{1,2}(?:\.\d+)?)(?:-(\d{1,2}(?:\.\d+)?))?\s*([EW])/g;
const slug = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
mkdirSync('navwarn', { recursive: true });
const index = { fetched: res.fetched, source: res.source, areas: [] }; const keep = new Set(['index.json']);
const seen = new Set();
for (const [area, info] of Object.entries(res.areas)) {
  if (!info.ok) { index.areas.push({ a: area, ok: false }); continue; }
  const L = res.w.filter(w => w.a === area && !seen.has(w.id) && seen.add(w.id)).map(({ id, d, t }) => ({ id, d, t }));
  let s = 90, n = -90, lons = [];
  for (const w of L) for (const m of w.t.matchAll(POS)) {
    let la = +m[1] + parseFloat(m[2]) / 60 + (m[3] ? parseFloat(m[3]) / 3600 : 0), lo = +m[5] + parseFloat(m[6]) / 60 + (m[7] ? parseFloat(m[7]) / 3600 : 0);
    if (m[4] === 'S') la = -la; if (m[8] === 'W') lo = -lo; if (Math.abs(la) > 90 || Math.abs(lo) > 180 || parseFloat(m[2]) >= 60 || parseFloat(m[6]) >= 60) continue;
    s = Math.min(s, la); n = Math.max(n, la); lons.push(lo);
  }
  // smallest longitude span (handles areas across 180°)
  let box = null;
  if (lons.length) { lons.sort((x, y) => x - y); let gap = -1, at = 0; for (let i = 0; i < lons.length; i++) { const nx = i + 1 < lons.length ? lons[i + 1] : lons[0] + 360; if (nx - lons[i] > gap) { gap = nx - lons[i]; at = i; } }
    const w0 = lons[(at + 1) % lons.length], e0 = lons[at]; box = [+s.toFixed(2), +w0.toFixed(2), +n.toFixed(2), +e0.toFixed(2)]; }
  const f = slug(area) + '.json', body = JSON.stringify({ a: area, w: L });
  writeFileSync('navwarn/' + f, body); keep.add(f);
  index.areas.push({ a: area, c: info.c || '', n: L.length, f, box, h: createHash('sha1').update(JSON.stringify(L)).digest('hex').slice(0, 10) });
}
for (const f of readdirSync('navwarn')) if (!keep.has(f)) unlinkSync('navwarn/' + f);
writeFileSync('navwarn/index.json', JSON.stringify(index));
if (existsSync('navwarn.json')) unlinkSync('navwarn.json');
console.log('files', keep.size);
