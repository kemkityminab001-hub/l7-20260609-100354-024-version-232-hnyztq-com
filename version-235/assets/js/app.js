(function () {
    "use strict";

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", String(!opened));
            panel.hidden = opened;
            button.textContent = opened ? "☰" : "×";
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero-slider");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll(".hero-dot", hero);
        var thumbs = selectAll(".hero-thumb", hero);
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
            thumbs.forEach(function (thumb, itemIndex) {
                thumb.classList.toggle("is-active", itemIndex === index);
            });
        }

        function move(step) {
            activate(index + step);
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                move(1);
            }, 5000);
        }

        dots.concat(thumbs).forEach(function (control) {
            control.addEventListener("click", function () {
                activate(Number(control.getAttribute("data-slide")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                play();
            });
        }

        activate(0);
        play();
    }

    function initImages() {
        selectAll("img[data-cover]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.remove();
            }, { once: true });
        });
    }

    function initSearchAndFilters() {
        var input = document.querySelector(".page-search-input");
        var cards = selectAll(".searchable-grid [data-search]");
        var chips = selectAll(".filter-chip");
        var params = new URLSearchParams(window.location.search);
        var activeFilter = "";

        if (input && params.get("q")) {
            input.value = params.get("q");
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var filter = normalize(activeFilter);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedFilter = !filter || haystack.indexOf(filter) !== -1;
                card.classList.toggle("is-filtered-out", !(matchedQuery && matchedFilter));
            });
        }

        if (input && cards.length) {
            input.addEventListener("input", apply);
            var form = input.closest("form");
            if (form) {
                form.addEventListener("submit", function (event) {
                    event.preventDefault();
                    apply();
                });
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                activeFilter = chip.getAttribute("data-filter") || "";
                apply();
            });
        });

        apply();
    }

    function initPlayers() {
        selectAll(".player-shell").forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            var stream = shell.getAttribute("data-stream");
            var hls;
            var ready = false;

            if (!video || !stream) {
                return;
            }

            function reveal() {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            }

            function playVideo() {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            function start() {
                reveal();
                if (!ready) {
                    ready = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            playVideo();
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                        video.load();
                        playVideo();
                    } else {
                        video.src = stream;
                        video.load();
                        playVideo();
                    }
                } else {
                    playVideo();
                }
            }

            if (overlay) {
                overlay.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initImages();
        initSearchAndFilters();
        initPlayers();
    });
})();
