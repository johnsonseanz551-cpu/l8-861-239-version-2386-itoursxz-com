(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function rootPrefix() {
    return document.body ? document.body.getAttribute("data-root") || "./" : "./";
  }

  function withRoot(path) {
    if (/^(https?:)?\/\//.test(path) || path.startsWith("#")) {
      return path;
    }
    return rootPrefix() + path.replace(/^\.\//, "");
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    play();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function renderSearch(panel, items) {
    if (!items.length) {
      panel.innerHTML = '<div class="search-result"><div></div><span>没有找到匹配影片</span></div>';
      panel.classList.add("is-open");
      return;
    }
    panel.innerHTML = items.slice(0, 12).map(function (item) {
      var href = withRoot(item.href);
      var cover = withRoot(item.cover);
      var title = escapeHtml(item.title);
      var meta = escapeHtml(item.region + " · " + item.type + " · " + item.year);
      return '<a class="search-result" href="' + href + '">' +
        '<img src="' + cover + '" alt="' + title + '">' +
        '<span><strong>' + title + '</strong><span>' + meta + '</span></span>' +
        '</a>';
    }).join("");
    panel.classList.add("is-open");
  }

  function initSearch() {
    var data = window.SEARCH_MOVIES || [];
    document.querySelectorAll("[data-site-search]").forEach(function (input) {
      var form = input.closest("form");
      var panel = form ? form.querySelector("[data-search-panel]") : null;
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        if (!query) {
          panel.classList.remove("is-open");
          panel.innerHTML = "";
          return;
        }
        var results = data.filter(function (item) {
          return item.text.indexOf(query) !== -1;
        });
        renderSearch(panel, results);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });
    });
    document.addEventListener("click", function (event) {
      document.querySelectorAll(".search-panel.is-open").forEach(function (panel) {
        if (!panel.parentElement.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function initLocalFilters() {
    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.classList.toggle("is-filter-hidden", query && text.indexOf(query) === -1);
        });
      });
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button) {
      return;
    }
    var attached = false;
    var hlsInstance = null;

    function safePlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attach(playAfterAttach) {
      if (attached) {
        if (playAfterAttach) {
          safePlay();
        }
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        if (playAfterAttach) {
          safePlay();
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        if (window.Hls.Events && hlsInstance.on) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (playAfterAttach) {
              safePlay();
            }
          });
        }
        if (playAfterAttach) {
          safePlay();
        }
        return;
      }
      video.src = streamUrl;
      video.load();
      if (playAfterAttach) {
        safePlay();
      }
    }

    function start() {
      button.classList.add("is-hidden");
      video.controls = true;
      attach(true);
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initLocalFilters();
  });
})();
