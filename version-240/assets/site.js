function toggleMobileNav() {
  var button = document.querySelector('[data-mobile-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', function () {
    nav.classList.toggle('is-open');
  });
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function setupPageSearch() {
  var panels = document.querySelectorAll('[data-page-search]');
  panels.forEach(function (panel) {
    var selector = panel.getAttribute('data-page-search');
    var scope = document.querySelector(selector);
    if (!scope) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var year = panel.querySelector('[data-year-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));

    function applyFilter() {
      var keyword = normalizeText(input && input.value);
      var yearValue = normalizeText(year && year.value);
      var typeValue = normalizeText(type && type.value);

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !yearValue || normalizeText(card.getAttribute('data-year')) === yearValue;
        var matchType = !typeValue || normalizeText(card.getAttribute('data-type')) === typeValue;
        card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
      applyFilter();
    }
  });
}

function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('[data-play-button]');
  if (!video || !overlay || !source) {
    return;
  }

  var attached = false;

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && Hls.isSupported()) {
      return new Promise(function (resolve) {
        var hls = new Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function startPlayback() {
    overlay.classList.add('is-hidden');
    attachSource().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    });
  }

  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  toggleMobileNav();
  setupPageSearch();
});
