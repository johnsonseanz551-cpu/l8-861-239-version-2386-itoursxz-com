(function () {
  var header = document.querySelector('[data-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showSlide(0);
    startHero();
  }

  var controls = Array.prototype.slice.call(document.querySelectorAll('[data-filter-control]'));
  if (controls.length) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-result]');
    var searchInput = document.querySelector('[data-search-input]');
    var categorySelect = document.querySelector('[data-category-select]');
    var yearSelect = document.querySelector('[data-year-select]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var category = normalize(categorySelect && categorySelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    controls.forEach(function (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  var shareButton = document.querySelector('[data-share]');
  if (shareButton) {
    shareButton.addEventListener('click', function () {
      var payload = {
        title: document.title,
        text: document.querySelector('meta[name="description"]') ? document.querySelector('meta[name="description"]').content : document.title,
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(payload).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(function () {});
      }
    });
  }
})();
