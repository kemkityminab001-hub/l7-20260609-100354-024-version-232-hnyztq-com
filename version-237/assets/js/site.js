(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dots] button"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    var timer = null;

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
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupCards() {
    var searchInput = document.querySelector("[data-card-search]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var sortSelect = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var original = cards.slice();
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (searchInput && query) {
      searchInput.value = query;
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : "");
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.textContent);
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
      });
    }

    function applySort() {
      var mode = sortSelect ? sortSelect.value : "default";
      var sorted = original.slice();
      if (mode === "year-desc") {
        sorted.sort(function (a, b) {
          return parseInt(b.getAttribute("data-year"), 10) - parseInt(a.getAttribute("data-year"), 10);
        });
      }
      if (mode === "year-asc") {
        sorted.sort(function (a, b) {
          return parseInt(a.getAttribute("data-year"), 10) - parseInt(b.getAttribute("data-year"), 10);
        });
      }
      if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", applySort);
    }
    applyFilter();
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupCards();
  });
})();
