(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 6200);
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var localCount = document.querySelector('[data-filter-count]');
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!localFilter || !localCards.length) {
            return;
        }

        var query = normalize(localFilter.value);
        var visible = 0;

        localCards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-filter'));
            var matched = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle('is-hidden-card', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (localCount) {
            localCount.textContent = String(visible);
        }
        if (emptyState) {
            emptyState.style.display = visible ? 'none' : 'block';
        }
    }

    if (localFilter) {
        localFilter.addEventListener('input', filterCards);
        filterCards();
    }
})();
