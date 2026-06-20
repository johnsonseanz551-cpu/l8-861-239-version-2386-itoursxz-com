(function () {
    var input = document.getElementById('search-page-input');
    var results = document.getElementById('search-results');
    var countText = document.getElementById('search-count-text');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (!input || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
        return;
    }

    input.value = query;

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="play-badge">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
            '<p class="movie-summary">' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function search(value) {
        var keyword = value.trim().toLowerCase();
        var source = window.MOVIE_SEARCH_INDEX;
        var matched = source.filter(function (movie) {
            if (!keyword) {
                return true;
            }
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(keyword) !== -1;
        }).slice(0, 120);

        results.innerHTML = matched.map(renderCard).join('');
        if (countText) {
            countText.textContent = keyword ? '已显示匹配内容' : '显示部分精选内容';
        }
    }

    input.addEventListener('input', function () {
        search(input.value);
    });

    search(query);
})();
