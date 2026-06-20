(function () {
  function setupMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    var message = document.getElementById(config.messageId);
    var loaded = false;
    var hls = null;

    if (!video || !config.source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function hideMessage() {
      if (message) {
        message.hidden = true;
        message.textContent = "";
      }
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      hideMessage();
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
        loaded = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showMessage("视频加载失败，请稍后重试");
          hls.destroy();
        });
        loaded = true;
        return;
      }
      showMessage("视频加载失败，请稍后重试");
    }

    function startPlayback() {
      loadVideo();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          startPlayback();
        }
      });
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
