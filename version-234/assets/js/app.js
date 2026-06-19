(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = form.getAttribute("action") || "library.html";
                }
            });
        });
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        var list = document.querySelector("[data-movie-list]");
        if (!panels.length || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        inputs.forEach(function (input) {
            input.value = query;
        });

        function valueOf(card, key) {
            return (card.getAttribute("data-" + key) || "").toLowerCase();
        }

        function apply() {
            var term = "";
            inputs.forEach(function (input) {
                if (input.value.trim()) {
                    term = input.value.trim().toLowerCase();
                }
            });
            var active = {};
            selects.forEach(function (select) {
                active[select.getAttribute("data-filter-select")] = select.value.toLowerCase();
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = ["title", "region", "type", "year", "genre", "tags"].map(function (key) {
                    return valueOf(card, key);
                }).join(" ");
                var matched = true;
                if (term && haystack.indexOf(term) === -1) {
                    matched = false;
                }
                Object.keys(active).forEach(function (key) {
                    if (active[key] && valueOf(card, key).indexOf(active[key]) === -1) {
                        matched = false;
                    }
                });
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", apply);
        });
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        apply();
    }

    function attachVideoSource(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    window.initVideoPlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playerOverlay");
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function startPlayback() {
            if (!attached) {
                hls = attachVideoSource(video, source);
                attached = true;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initFilters();
    });
})();
