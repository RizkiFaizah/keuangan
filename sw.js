const C="keuangan-v6",F=["./","index.html","xlsx.full.min.js","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// File besar (library Excel, ikon): cache dulu. File aplikasi (index.html dll): ambil yang terbaru dari internet kalau ada, kalau offline atau lambat pakai simpanan.
function netFirst(req){
  return new Promise(res=>{
    let done=false;
    const fallback=()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match("index.html"));
    const t=setTimeout(()=>{if(!done){done=true;fallback().then(res)}},3000);
    fetch(req,{cache:"no-cache"}).then(n=>{
      if(n&&n.ok){const cp=n.clone();caches.open(C).then(c=>c.put(req,cp))}
      if(!done){done=true;clearTimeout(t);res(n)}
    }).catch(()=>{if(!done){done=true;clearTimeout(t);fallback().then(res)}});
  });
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(/xlsx\.full\.min\.js|icon-\d+\.png/.test(u.pathname)){
    e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)));
  }else{
    e.respondWith(netFirst(e.request));
  }
});
