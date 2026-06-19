(function () {
    var index = window.SEARCH_MOVIES || [];
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!form || !input || !results || !count) {
        return;
    }

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function render(query) {
        var text = normalize(query);
        var matched = text
            ? index.filter(function (item) {
                return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags + ' ' + item.oneLine).indexOf(text) !== -1;
            })
            : index.slice(0, 80);

        count.textContent = String(matched.length);
        results.innerHTML = matched.slice(0, 120).map(function (item) {
            return '<article class="search-result-item">' +
                '<a class="search-thumb" href="./' + item.url + '">' +
                    '<img src="./' + item.cover + '" alt="' + escapeHtml(item.title) + ' 海报" loading="lazy" onerror="this.remove()" />' +
                '</a>' +
                '<div>' +
                    '<h2><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
                    '<div class="search-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '</div>' +
            '</article>';
        }).join('');

        if (!matched.length) {
            results.innerHTML = '<div class="empty-state">没有找到匹配影片，可尝试更换关键词。</div>';
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    render(initial);

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        render(query);
    });
})();
