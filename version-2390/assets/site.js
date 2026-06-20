(function () {
  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5000);
    }
  }

  function getCards(targetSelector) {
    var target = targetSelector ? document.querySelector(targetSelector) : document.querySelector('[data-search-scope]');

    if (!target) {
      return [];
    }

    return Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
  }

  function applyFilters(targetSelector, query, typeValue, countSelector) {
    var cards = getCards(targetSelector);
    var visible = 0;
    var normalizedQuery = String(query || '').trim().toLowerCase();
    var normalizedType = String(typeValue || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
      var meta = (card.getAttribute('data-meta') || '').toLowerCase();
      var matchesQuery = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
      var matchesType = !normalizedType || meta.indexOf(normalizedType) !== -1;
      var matches = matchesQuery && matchesType;

      card.classList.toggle('is-hidden', !matches);

      if (matches) {
        visible += 1;
      }
    });

    if (countSelector) {
      var count = document.querySelector(countSelector);

      if (count) {
        count.textContent = visible + ' 部';
      }
    }
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-type-filter]'));

    inputs.forEach(function (input) {
      var target = input.getAttribute('data-search-target');
      var count = input.getAttribute('data-search-count');

      input.addEventListener('input', function () {
        var linkedSelect = document.querySelector('[data-filter-target="' + target + '"]');
        applyFilters(target, input.value, linkedSelect ? linkedSelect.value : '', count);
      });
    });

    selects.forEach(function (select) {
      var target = select.getAttribute('data-filter-target');
      var linkedInput = document.querySelector('[data-search-target="' + target + '"]');
      var count = linkedInput ? linkedInput.getAttribute('data-search-count') : '';

      select.addEventListener('change', function () {
        applyFilters(target, linkedInput ? linkedInput.value : '', select.value, count);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
