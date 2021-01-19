self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("static").then(cache => {
            return cache.addAll(["images/coachtoolsLogoBlack614.png", "images/coachtoolsLogoBlack.png", "/users/login", "/", "/aboutUs", "/contactUs", "css/style.css"]);
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