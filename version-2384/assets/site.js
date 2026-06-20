(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      var index = 0;
      var timer;
      if (!slides.length) {
        return;
      }
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }
      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-slide")) || 0);
          restart();
        });
      });
      restart();
    });
  }

  function collectOptions(cards, selector, field) {
    var select = document.querySelector(selector);
    if (!select || select.options.length > 1) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var raw = card.getAttribute(field) || "";
      raw.split(/[,，、/\s]+/).forEach(function (item) {
        var value = normalize(item);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
    });
    values.slice(0, 80).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var input = document.getElementById("movieSearch");
    var region = document.getElementById("regionFilter");
    var genre = document.getElementById("genreFilter");
    var year = document.getElementById("yearFilter");
    var empty = document.querySelector(".empty-state");
    if (!cards.length || (!input && !region && !genre && !year)) {
      return;
    }
    collectOptions(cards, "#regionFilter", "data-region");
    collectOptions(cards, "#genreFilter", "data-genre");
    collectOptions(cards, "#yearFilter", "data-year");
    function apply() {
      var query = normalize(input && input.value);
      var selectedRegion = normalize(region && region.value);
      var selectedGenre = normalize(genre && genre.value);
      var selectedYear = normalize(year && year.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.textContent
        ].join(" ").toLowerCase();
        var match = true;
        if (query && haystack.indexOf(query) === -1) {
          match = false;
        }
        if (selectedRegion && normalize(card.getAttribute("data-region")).indexOf(selectedRegion) === -1) {
          match = false;
        }
        if (selectedGenre && normalize(card.getAttribute("data-genre")).indexOf(selectedGenre) === -1) {
          match = false;
        }
        if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
          match = false;
        }
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [input, region, genre, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupNavigation();
    setupCarousel();
    setupFilters();
  });
})();
