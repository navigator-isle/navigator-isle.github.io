/* Passage Planner service worker – app works fully offline after the first visit.
   App shell: cache-first (updated in the background). Libraries from CDNs: cached on first use.
   Live data (warnings, weather, chart tiles): always from the network – the app keeps its own copies. */
const VER='pp-v6-2026-10-20';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-512.png','./apple-touch-icon.png','./favicon-32.png','./privacy.html'];
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)\//;
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==VER).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  // app shell (same origin): serve from cache, refresh in background
  if(u.origin===location.origin){
    const appPage=u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
    if(r.mode==='navigate'&&appPage){e.respondWith(caches.match('./index.html').then(c=>{const net=fetch(r).then(res=>{if(res.ok)caches.open(VER).then(x=>x.put('./index.html',res.clone()));return res}).catch(()=>c);return c||net}));return}
    e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res.ok)caches.open(VER).then(x=>x.put(r,res.clone()));return res})));return}
  // CDN libraries (Excel import, PDF reader): cache on first use
  if(CDN.test(r.url)){e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res.ok||res.type==='opaque')caches.open(VER).then(x=>x.put(r,res.clone()));return res})));return}
  // everything else (NAVAREA warnings, weather, map tiles) goes straight to the network
});
