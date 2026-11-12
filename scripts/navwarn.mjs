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
      const nm = 'COASTAL ' + String(g.name || g.title || g.country || g.id).toUpperCase();
      const rr = await get(`https://www.sealagom.com/feeds/warnings.txt?coastal=${encodeURIComponent(g.id)}&limit=500`, 2);
      if (!rr) continue; const L = parse(await rr.text(), nm); if (L.length) { res.areas[nm] = { ok: true, n: L.length, c: g.country || '' }; res.w.push(...L); }
    }
  }
} catch (e) { console.log('coastal:', e.message); }
const okAreas = Object.values(res.areas).filter(a => a.ok).length;
console.log('areas ok', okAreas, 'warnings', res.w.length);
if (okAreas < 10) { console.log('Too few areas – keeping the previous file'); process.exit(0); }
const prev = existsSync('navwarn.json') ? JSON.parse(readFileSync('navwarn.json', 'utf8')) : null;
writeFileSync('navwarn.json', JSON.stringify(res));
console.log('changed:', !prev || JSON.stringify(prev.w) !== JSON.stringify(res.w));
