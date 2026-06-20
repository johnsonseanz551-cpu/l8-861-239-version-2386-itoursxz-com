import { H as Hls } from './video-vendor-dru42stk.js';

export function initializeMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var prepared = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          video.src = source;
        }
      });
      return;
    }

    video.src = source;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  }

  function startPlayback() {
    prepare();
    hideOverlay();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showOverlay();
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('ended', showOverlay);
}
