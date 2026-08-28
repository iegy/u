const CACHE='u-utility-studio-v8';
const ASSETS=['./','index.html','styles.css','enhancements.css','app.js','ux-core.js','ux-calc.js','ux-dev.js','ux-persist.js','ux-studio.js','icon.svg','logo.svg','manifest.webmanifest'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const appAsset=event.request.mode==='navigate'||/\.(?:js|css|html)$/.test(url.pathname);
  if(appAsset){
    event.respondWith(fetch(event.request).then(response=>{if(response&&(response.ok||response.type==='opaque')){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?caches.match('index.html'):Response.error()))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response&&(response.ok||response.type==='opaque')){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>Response.error())));
});