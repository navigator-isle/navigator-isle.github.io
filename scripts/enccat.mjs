// ENC cell list (cell name + coverage limits) from the IC-ENC weekly catalogue, refreshed once a week.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
mkdirSync('enc', { recursive: true });
let old = null; try { old = JSON.parse(readFileSync('enc/cells.json', 'utf8')); } catch { }
if (old && Date.now() - Date.parse(old.fetched) < 6 * 864e5 && !process.env.FORCE) { console.log('ENC list is recent'); process.exit(0); }
const r = await fetch('https://www.ic-enc.org/s/catalogue.txt', { headers: { 'User-Agent': 'Mozilla/5.0 PassagePlanner' }, signal: AbortSignal.timeout(60000) }).catch(e => null);
if (!r || !r.ok) { console.log('IC-ENC catalogue not reachable'); process.exit(0); }
const txt = (await r.text()).replace(/^﻿/, '');
const cells = []; let issued = '';
for (const line of txt.split(/\r?\n/)) {
  const f = line.split(',');
  if (f[0] === '0') { issued = f[2] || ''; continue; }
  if (f[0] !== '2' || f.length < 12) continue;
  const nm = f[1].trim(); if (!/^[A-Z0-9]{2}[1-6][A-Z0-9]{5}$/.test(nm)) continue;
  const [s, w, n, e] = f.slice(-4).map(Number); if (![s, w, n, e].every(Number.isFinite)) continue;
  const title = f.slice(2, f.length - 9).join(',').replace(/\s+/g, ' ').trim();
  cells.push([nm, s, w, n, e, title]);
}
console.log('cells', cells.length);
if (cells.length < 5000) { console.log('too few cells – keeping the old list'); process.exit(0); }
writeFileSync('enc/cells.json', JSON.stringify({ fetched: new Date().toISOString(), issued, source: 'IC-ENC catalogue.txt (www.ic-enc.org) – cells distributed through IC-ENC', cells }));
