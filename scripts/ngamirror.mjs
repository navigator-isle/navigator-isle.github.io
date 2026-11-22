// Mirror of the NGA MSI broadcast-warning feed, so the app has a backup when NGA blocks phones.
import { writeFileSync } from 'node:fs';
const URL = 'https://msi.nga.mil/api/publications/broadcast-warn?output=json&status=active';
try {
  const r = await fetch(URL, { headers: { 'user-agent': 'PassagePlanner-mirror (navigator-isle.github.io)' }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  const n = (j['broadcast-warn'] || []).length;
  if (!n) throw new Error('empty feed');
  writeFileSync('navwarn/nga.json', JSON.stringify(j));
  console.log('NGA mirror: ' + n + ' warnings');
} catch (e) { console.log('NGA mirror skipped (old copy kept): ' + e.message); }
