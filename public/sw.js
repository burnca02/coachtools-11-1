// service worker creation
// needed for the app to be installed/created
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("static").then(cache => {
            self.caches.delete('static');
            // this line caches certain files that can be accessed without wifi - DONT PUT FILES IN HERE THAT CHANGE FREQUENTLY
            return cache.addAll(["images/coachtoolsLogoBlack.png"]);  //"images/coachtoolsLogoBlack614.png", , "/users/login", "/", "/aboutUs", "/contactUs", "css/style.css"
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
