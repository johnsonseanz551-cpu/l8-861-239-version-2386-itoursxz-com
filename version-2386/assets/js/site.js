(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHeroCarousel() {
    var carousel = qs('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupCardFilter() {
    var form = qs('[data-card-filter]');
    var grid = qs('[data-card-grid]');
    var empty = qs('[data-empty-state]');

    if (!form || !grid) {
      return;
    }

    var input = qs('input', form);
    var cards = qsa('.movie-card', grid);

    function filterCards() {
      var keyword = (input.value || '').trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });

    input.addEventListener('input', filterCards);
  }

  function setupSearchPage() {
    var page = qs('[data-page="search"]');

    if (!page || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('[data-search-page-form] input', page);
    var grid = qs('[data-search-results]', page);
    var title = qs('[data-search-title]', page);
    var count = qs('[data-search-count]', page);
    var empty = qs('[data-search-empty]', page);

    if (input) {
      input.value = query;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function card(movie) {
      var tagHtml = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
          '<a class="movie-poster" href="./' + escapeHtml(movie.url) + '">' +
            '<img src="./' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-play">▶</span>' +
          '</a>' +
          '<div class="movie-info">' +
            '<div class="movie-meta">' +
              '<span>' + escapeHtml(movie.year) + '</span>' +
              '<span>' + escapeHtml(movie.region) + '</span>' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
            '</div>' +
            '<h3><a href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tagHtml + '</div>' +
          '</div>' +
        '</article>';
    }

    if (!query) {
      if (title) {
        title.textContent = '请输入关键词开始搜索';
      }
      if (count) {
        count.textContent = '等待搜索';
      }
      if (empty) {
        empty.classList.add('show');
      }
      return;
    }

    var normalized = query.toLowerCase();
    var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.categoryName,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 240);

    if (title) {
      title.textContent = '“' + query + '” 的搜索结果';
    }
    if (count) {
      count.textContent = results.length + ' 条匹配';
    }
    if (grid) {
      grid.innerHTML = results.map(card).join('');
    }
    if (empty) {
      empty.textContent = results.length ? '' : '没有找到匹配影片，请换一个关键词。';
      empty.classList.toggle('show', results.length === 0);
    }
  }

  function setupPlayer() {
    qsa('[data-player]').forEach(function (playerBox) {
      var video = qs('video[data-src]', playerBox);
      var button = qs('[data-player-init]', playerBox);
      var message = qs('[data-player-message]', playerBox);
      var initialized = false;

      if (!video || !button) {
        return;
      }

      function setMessage(value) {
        if (message) {
          message.textContent = value || '';
        }
      }

      function initAndPlay() {
        var source = video.getAttribute('data-src');

        if (!source) {
          setMessage('未找到播放源。');
          return;
        }

        button.classList.add('is-hidden');

        if (!initialized) {
          initialized = true;

          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage('当前播放源加载失败，请刷新后重试或更换浏览器。');
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            video.src = source;
            setMessage('浏览器未检测到 HLS.js，正在尝试原生播放。');
          }
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
            setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
          });
        }
      }

      button.addEventListener('click', initAndPlay);
      playerBox.addEventListener('click', function (event) {
        if (event.target === playerBox) {
          initAndPlay();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupCardFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
