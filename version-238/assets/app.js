(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var passType = !typeValue || card.getAttribute('data-type') === typeValue;
        var pass = passKeyword && passYear && passType;
        card.style.display = pass ? '' : 'none';
        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  });

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var formInput = document.querySelector('.search-page-form input[name="q"]');
    var results = searchPage.querySelector('[data-search-results]');
    var title = searchPage.querySelector('[data-search-title]');
    var caption = searchPage.querySelector('[data-search-caption]');

    if (formInput) {
      formInput.value = query;
    }

    function movieCard(movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a class="poster-link" href="./' + movie.page + '" aria-label="' + escapeHtml(movie.title) + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
        '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
        '<span class="poster-play">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<a href="./' + movie.page + '" class="movie-title">' + escapeHtml(movie.title) + '</a>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    if (!query) {
      if (results) {
        results.innerHTML = '';
      }
      if (title) {
        title.textContent = '搜索结果';
      }
      if (caption) {
        caption.textContent = '输入关键词查看相关内容。';
      }
      return;
    }

    var lower = query.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 120);

    if (title) {
      title.textContent = '搜索：' + query;
    }
    if (caption) {
      caption.textContent = matched.length ? '找到 ' + matched.length + ' 部相关内容。' : '没有找到相关内容，换个关键词再试。';
    }
    if (results) {
      results.innerHTML = matched.map(movieCard).join('');
    }
  }
})();
