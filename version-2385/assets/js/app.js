(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function togglePanel(buttonSelector, panelSelector) {
        var button = $(buttonSelector);
        var panel = $(panelSelector);
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    togglePanel('.search-toggle', '.search-panel');
    togglePanel('.mobile-toggle', '.mobile-nav');

    var carousel = $('[data-carousel]');
    if (carousel) {
        var slides = $all('.hero-slide', carousel);
        var dots = $all('.hero-dot', carousel);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-slide') || 0));
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    $all('.filter-panel').forEach(function (panel) {
        var input = $('.card-filter-input', panel);
        var grid = panel.parentElement ? $('.filterable-grid', panel.parentElement) : null;
        if (!input || !grid) {
            return;
        }
        var cards = $all('.movie-card', grid);
        var chips = $all('[data-filter]', panel);
        var activeFilter = 'all';

        function matchCard(card) {
            var text = [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.getAttribute('data-type') || ''
            ].join(' ').toLowerCase();
            var keyword = input.value.trim().toLowerCase();
            var chipOk = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
            var keywordOk = !keyword || text.indexOf(keyword) !== -1;
            return chipOk && keywordOk;
        }

        function applyFilter() {
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matchCard(card));
            });
        }

        input.addEventListener('input', applyFilter);
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                activeFilter = chip.getAttribute('data-filter') || 'all';
                applyFilter();
            });
        });
    });
})();

function initMoviePlayer(videoId, source, buttonSelector) {
    var video = document.getElementById(videoId);
    var startButton = document.querySelector(buttonSelector);
    if (!video) {
        return;
    }

    var attached = false;
    var playerFrame = video.closest('.player-frame');

    function attachSource() {
        if (attached) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            attached = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsPlayer = hls;
            attached = true;
            return;
        }
        video.src = source;
        attached = true;
    }

    function startPlayback() {
        attachSource();
        if (playerFrame) {
            playerFrame.classList.add('is-playing');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (startButton) {
        startButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (playerFrame) {
            playerFrame.classList.add('is-playing');
        }
    });
}
