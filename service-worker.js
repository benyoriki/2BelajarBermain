/* Service worker portal Dino Family Play — ringan. Game punya service worker sendiri di foldernya. */
var V='dfp-portal-v18';
var SHELL=['./','index.html','style.css?v=18','app.js?v=18','manifest.json','assets/fredoka.woff2','assets/logo.png','assets/hero-jungle.webp','assets/hero-family-play.webp','assets/icon-192.png','assets/favicon.png',
'assets/dino-blue.webp','assets/dino-pink.webp','assets/dino-green.webp','assets/dino-red.webp','assets/dino-yellow.webp','assets/dino-pterodactyl.webp','assets/ular-tangga.webp','assets/monopoli.webp'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k.indexOf('dfp-portal-')===0&&k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
 var r=e.request;if(r.method!=='GET')return;
 var u=new URL(r.url);if(u.origin!==location.origin)return;
 if(/\/(Ular_tangga_v01|monopoli_v01)\//i.test(u.pathname))return;
 var net=r.mode==='navigate'||r.destination==='script'||r.destination==='style';
 if(net){e.respondWith(fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res}).catch(function(){return caches.match(r,{ignoreSearch:r.mode==='navigate'}).then(function(h){return h||caches.match('index.html')})}));return}
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(h){return h||fetch(r).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res})}));
});
