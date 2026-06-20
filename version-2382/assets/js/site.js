(function() {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        restart();
      });
    });
    restart();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function(area) {
    var input = area.querySelector('[data-filter-input]');
    var yearSelect = area.querySelector('[data-filter-year]');
    var genreSelect = area.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
    var empty = area.querySelector('[data-filter-empty]');

    function applyQueryFromUrl() {
      if (!area.hasAttribute('data-read-query') || !input) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    function filter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      var visible = 0;
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var okQuery = !query || text.indexOf(query) !== -1;
        var okYear = !year || cardYear === year;
        var okGenre = !genre || cardGenre.indexOf(genre) !== -1;
        var ok = okQuery && okYear && okGenre;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    applyQueryFromUrl();
    [input, yearSelect, genreSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
    filter();
  });
}());
