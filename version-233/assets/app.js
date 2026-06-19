(function () {
    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function toggleMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function filterCards(query) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var term = normalize(query);
        if (!cards.length) {
            return false;
        }
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var title = normalize(card.getAttribute("data-title"));
            var matched = !term || haystack.indexOf(term) !== -1 || title.indexOf(term) !== -1;
            card.classList.toggle("is-filtered-out", !matched);
        });
        return true;
    }

    function setupSearchForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[type='search']");
                var query = input ? input.value : "";
                if (!filterCards(query)) {
                    var target = "./ranking.html";
                    if (query.trim()) {
                        target += "?q=" + encodeURIComponent(query.trim());
                    }
                    window.location.href = target;
                }
            });
        });
    }

    function setupLiveFilters() {
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-live-filter]"));
        filters.forEach(function (form) {
            var input = form.querySelector("input[type='search']");
            if (!input) {
                return;
            }
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (initialQuery) {
            var firstFilter = document.querySelector("[data-live-filter] input[type='search']");
            if (firstFilter) {
                firstFilter.value = initialQuery;
            }
            filterCards(initialQuery);
        }
    }

    function setupSorting() {
        var select = document.querySelector("[data-sort-select]");
        var area = document.querySelector("[data-sort-area]");
        if (!select || !area) {
            return;
        }
        var original = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
        select.addEventListener("change", function () {
            var value = select.value;
            var cards = original.slice();
            if (value === "year-desc") {
                cards.sort(function (a, b) {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                });
            }
            if (value === "year-asc") {
                cards.sort(function (a, b) {
                    return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
                });
            }
            if (value === "title") {
                cards.sort(function (a, b) {
                    return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                });
            }
            if (value === "default") {
                cards = original.slice();
            }
            cards.forEach(function (card) {
                area.appendChild(card);
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        start();
    }

    window.setupMoviePlayer = function (source) {
        var video = document.querySelector("[data-player-video]");
        var overlay = document.querySelector("[data-player-overlay]");
        if (!video || !source) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        function startPlayback() {
            if (overlay) {
                overlay.classList.add("hidden");
            }
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        toggleMobileMenu();
        setupSearchForms();
        setupLiveFilters();
        setupSorting();
        setupHeroCarousel();
    });
})();
