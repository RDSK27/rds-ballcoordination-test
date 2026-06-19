// Service Worker - Ball Coordination Test (RDS)
// Uso sin conexion: cachea la app y el SDK de Firebase (gstatic).
// Las llamadas de datos a Firestore NO se cachean (las gestiona la
// persistencia offline de Firestore).
var CACHE = "coord1-v33";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
  );
});

self.addEventListener("message", function(e){
  if (e.data && e.data.action === "skipWaiting") {
    self.skipWaiting();
  }
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
  var url = e.request.url;
  var cacheable = (url.indexOf(self.location.origin) === 0) ||
                  (url.indexOf("https://www.gstatic.com/") === 0);
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if (cached) return cached;
      return fetch(e.request).then(function(resp){
        if (cacheable){
          var clone = resp.clone();
          caches.open(CACHE).then(function(c){ try { c.put(e.request, clone); } catch(err){} });
        }
        return resp;
      }).catch(function(){
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
