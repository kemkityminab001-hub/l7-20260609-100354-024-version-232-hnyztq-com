import { MOVIE_INDEX } from './movie-index.js';

const params = new URLSearchParams(window.location.search);
const query = (params.get('q') || '').trim();
const form = document.querySelector('.js-search-page-form');
const input = form ? form.querySelector('input[name="q"]') : null;
const status = document.getElementById('search-status');
const results = document.getElementById('search-results');

if (input) {
  input.value = query;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    };

    return map[char];
  });
}

function buildCard(movie) {
  const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
          <article class="movie-card grid" data-title="${escapeHtml(movie.title)}" data-year="${escapeHtml(movie.year)}" data-genre="${escapeHtml(movie.genre)}" data-region="${escapeHtml(movie.region)}">
            <a class="poster-link" href="${movie.url}" aria-label="观看 ${escapeHtml(movie.title)}">
              <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
              <span class="play-badge">▶</span>
            </a>
            <div class="movie-card-body">
              <div class="card-meta">
                <span>${escapeHtml(movie.year)}</span>
                <span>${escapeHtml(movie.region)}</span>
                <span>${escapeHtml(movie.type)}</span>
              </div>
              <h3><a href="${movie.url}">${escapeHtml(movie.title)}</a></h3>
              <p>${escapeHtml(movie.description)}</p>
              <div class="tag-row">${tags}</div>
            </div>
          </article>`;
}

function runSearch(keyword) {
  if (!results || !status) {
    return;
  }

  const normalized = keyword.trim().toLowerCase();

  if (!normalized) {
    results.innerHTML = '';
    status.textContent = '输入关键词开始搜索';
    return;
  }

  const matched = MOVIE_INDEX.filter((movie) => {
    const content = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.description,
      movie.category,
      movie.tags.join(' '),
    ].join(' ').toLowerCase();

    return content.includes(normalized);
  }).slice(0, 120);

  status.textContent = `找到 ${matched.length} 个相关结果`;
  results.innerHTML = matched.map(buildCard).join('');
}

runSearch(query);

if (input) {
  input.addEventListener('input', () => {
    runSearch(input.value);
  });
}
