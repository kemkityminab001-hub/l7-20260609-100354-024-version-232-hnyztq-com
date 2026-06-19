(function () {
    var video = document.querySelector('[data-video-player]');
    var button = document.querySelector('[data-player-button]');

    if (!video || !button) {
        return;
    }

    var playUrl = button.getAttribute('data-play-url');
    var player = null;

    function startPlayback() {
        button.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.getAttribute('src')) {
                video.setAttribute('src', playUrl);
            }
            var nativePlay = video.play();
            if (nativePlay && nativePlay.catch) {
                nativePlay.catch(function () {});
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!player) {
                player = new window.Hls();
                player.loadSource(playUrl);
                player.attachMedia(video);
                player.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    var hlsPlay = video.play();
                    if (hlsPlay && hlsPlay.catch) {
                        hlsPlay.catch(function () {});
                    }
                });
            } else {
                var replay = video.play();
                if (replay && replay.catch) {
                    replay.catch(function () {});
                }
            }
            return;
        }

        if (!video.getAttribute('src')) {
            video.setAttribute('src', playUrl);
        }
        var directPlay = video.play();
        if (directPlay && directPlay.catch) {
            directPlay.catch(function () {});
        }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
})();
