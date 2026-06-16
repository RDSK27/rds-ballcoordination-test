// Service Worker - Ball Coordination Test (RDS)
// Permite usar la app sin conexion una vez abierta con red.
var CACHE = "coord1-v3";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if (cached) return cached;
      return fetch(e.request).then(function(resp){
        return caches.open(CACHE).then(function(c){
          try { c.put(e.request, resp.clone()); } catch(err){}
          return resp;
        });
      }).catch(function(){
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
