(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs("[data-menu-button]");
        var panel = qs("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var next = qs("[data-hero-next]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        restart();
    }

    function setupCategoryFilters() {
        var panel = qs("[data-filter-panel]");
        var grid = qs("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }
        var keyword = qs("[data-filter-keyword]", panel);
        var year = qs("[data-filter-year]", panel);
        var region = qs("[data-filter-region]", panel);
        var type = qs("[data-filter-type]", panel);
        var cards = qsa("[data-movie-card]", grid);

        function value(el) {
            return el ? el.value.trim().toLowerCase() : "";
        }

        function apply() {
            var key = value(keyword);
            var y = value(year);
            var r = value(region);
            var t = value(type);
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();
                var ok = true;
                if (key && text.indexOf(key) === -1) {
                    ok = false;
                }
                if (y && String(card.getAttribute("data-year")).toLowerCase() !== y) {
                    ok = false;
                }
                if (r && String(card.getAttribute("data-region")).toLowerCase() !== r) {
                    ok = false;
                }
                if (t && String(card.getAttribute("data-type")).toLowerCase() !== t) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
            });
        }

        [keyword, year, region, type].forEach(function (el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
    }

    function setupSearchPage() {
        var box = qs("[data-search-results]");
        if (!box) {
            return;
        }
        var form = qs("[data-search-page-form]");
        var input = form ? qs("input[name='q']", form) : null;
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }

        function render(q) {
            var data = window.movieSearchIndex || [];
            var key = q.trim().toLowerCase();
            if (!key) {
                box.innerHTML = '<div class="empty-state">请输入关键词搜索影片。</div>';
                return;
            }
            var results = data.filter(function (item) {
                return [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(" ").toLowerCase().indexOf(key) !== -1;
            }).slice(0, 120);
            if (!results.length) {
                box.innerHTML = '<div class="empty-state">没有找到相关影片。</div>';
                return;
            }
            box.innerHTML = '<div class="section-head"><div><h2>搜索结果</h2><p>点击卡片进入影片详情页。</p></div></div><div class="movie-grid">' + results.map(function (item) {
                return '<a class="movie-card" href="./' + item.file + '">' +
                    '<span class="poster-wrap"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + ' 在线观看" loading="lazy"><span class="poster-shade"></span><span class="score-badge">' + item.rating + '</span></span>' +
                    '<span class="movie-card-body"><strong>' + escapeHtml(item.title) + '</strong><span class="movie-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span><span class="movie-line">' + escapeHtml(item.oneLine) + '</span><span class="tag-row"><span>' + escapeHtml(item.genre) + '</span></span></span>' +
                    '</a>';
            }).join("") + '</div>';
        }

        if (form && input) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var nextQuery = input.value.trim();
                var url = nextQuery ? "./search.html?q=" + encodeURIComponent(nextQuery) : "./search.html";
                window.history.replaceState(null, "", url);
                render(nextQuery);
            });
        }
        render(query);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.setupMoviePlayer = function (source) {
        var video = qs("[data-player-video]");
        var overlay = qs("[data-player-overlay]");
        var button = qs("[data-player-button]");
        if (!video || !overlay || !button || !source) {
            return;
        }
        var ready = false;
        var hls = null;

        function prepare() {
            if (ready) {
                return;
            }
            ready = true;
            video.setAttribute("controls", "controls");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            overlay.classList.add("is-hidden");
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupCategoryFilters();
        setupSearchPage();
    });
})();
