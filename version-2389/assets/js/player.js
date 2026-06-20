(function () {
  function mountPlayer(id, source) {
    var root = document.getElementById(id);
    if (!root) {
      return;
    }

    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');
    var started = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      attachSource();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    video.addEventListener('error', function () {
      if (hlsInstance && hlsInstance.recoverMediaError) {
        hlsInstance.recoverMediaError();
      }
    });
  }

  window.MoviePlayer = {
    mount: mountPlayer
  };
})();
