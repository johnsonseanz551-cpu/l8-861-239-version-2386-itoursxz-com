(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = !panel.hasAttribute('hidden');
      if (isOpen) {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var previousButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startHero();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startHero();
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindFilter(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-select]');
    var trigger = scope.querySelector('[data-filter-button]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-meta]'));
    var empty = document.querySelector('.empty-state');

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var chosen = normalize(select ? select.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedSelect = !chosen || text.indexOf(chosen) !== -1;
        var visible = matchedKeyword && matchedSelect;

        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }

    if (trigger) {
      trigger.addEventListener('click', applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (input && q) {
      input.value = q;
    }

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(bindFilter);

  window.initializePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video || !sourceUrl) {
      return;
    }

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function play() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }

    attach();

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };
})();
