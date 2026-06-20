(function () {
    function setupMobileNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMovieFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-filter-list]');
        if (!panel || !list) {
            return;
        }
        var search = panel.querySelector('[data-search-input]');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-result]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function cardText(card) {
            return normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.textContent
            ].join(' '));
        }

        function apply() {
            var query = search ? normalize(search.value) : '';
            var rules = {};
            selects.forEach(function (select) {
                rules[select.dataset.filterSelect] = normalize(select.value);
            });
            var visible = 0;
            cards.forEach(function (card) {
                var matched = true;
                if (query && cardText(card).indexOf(query) === -1) {
                    matched = false;
                }
                Object.keys(rules).forEach(function (key) {
                    if (!rules[key]) {
                        return;
                    }
                    if (normalize(card.dataset[key]).indexOf(rules[key]) === -1) {
                        matched = false;
                    }
                });
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        if (search) {
            search.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupMovieFilters();
    });
})();
