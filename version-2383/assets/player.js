var hlsModulePromise = import('./hls.js').catch(function () {
    return null;
});

function showMessage(frame, text) {
    var message = frame.querySelector('[data-player-message]');
    if (!message) {
        return;
    }
    message.textContent = text;
    message.hidden = false;
}

async function attachStream(video, frame) {
    if (video.dataset.ready === 'true') {
        return;
    }
    var stream = video.dataset.stream;
    if (!stream) {
        showMessage(frame, '视频暂时无法加载，请稍后再试。');
        return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.dataset.ready = 'true';
        return;
    }
    var module = await hlsModulePromise;
    var Hls = module && module.H;
    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.dataset.ready = 'true';
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                showMessage(frame, '网络连接不稳定，正在重新加载。');
                return;
            }
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                showMessage(frame, '视频正在恢复播放。');
                return;
            }
            showMessage(frame, '视频暂时无法播放，请刷新页面后重试。');
            hls.destroy();
        });
        video.hlsController = hls;
        return;
    }
    showMessage(frame, '浏览器暂不支持该视频格式，请尝试使用现代浏览器。');
}

function setupPlayer(frame) {
    var video = frame.querySelector('video[data-stream]');
    var button = frame.querySelector('[data-play-button]');
    if (!video || !button) {
        return;
    }
    attachStream(video, frame);
    button.addEventListener('click', async function () {
        button.classList.add('hidden');
        await attachStream(video, frame);
        try {
            await video.play();
        } catch (error) {
            button.classList.remove('hidden');
            showMessage(frame, '点击视频控件可继续播放。');
        }
    });
    video.addEventListener('play', function () {
        button.classList.add('hidden');
    });
    video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
