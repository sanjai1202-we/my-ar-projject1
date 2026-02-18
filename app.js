// ======================================================================
// CONFIGURATION
// ======================================================================
const AR_CONTENT = [
    { videoSrc: './assets/video.mp4', height: 0.5625 },
];

/**
 * Video Controller Component
 * Handles play/pause logic with a "grace period" to prevent flickering
 * when tracking is temporarily lost (e.g., partial occlusion).
 */
AFRAME.registerComponent('video-controller', {
    schema: {
        videoSelector: { type: 'string', default: '' },
        gracePeriod: { type: 'number', default: 500 } // Time in ms before pausing
    },
    init: function () {
        if (!this.data.videoSelector) return;
        this.videoEl = document.querySelector(this.data.videoSelector);
        this.lossTimeout = null;

        // Bind functions
        this.onTargetFound = this.onTargetFound.bind(this);
        this.onTargetLost = this.onTargetLost.bind(this);

        // Events
        this.el.addEventListener('targetFound', this.onTargetFound);
        this.el.addEventListener('targetLost', this.onTargetLost);
    },

    onTargetFound: function () {
        // If we were about to pause, CANCEL it!
        if (this.lossTimeout) {
            clearTimeout(this.lossTimeout);
            this.lossTimeout = null;
        }

        if (this.videoEl) {
            this.videoEl.muted = false;
            // Only play if not already playing to avoid stutters
            if (this.videoEl.paused) {
                this.videoEl.play().catch(e => console.warn("Autoplay blocked:", e));
            }
        }
    },

    onTargetLost: function () {
        // Don't pause immediately. Wait a moment to see if it comes back.
        // This handles the "1/2 image" case where tracking might flicker.
        this.lossTimeout = setTimeout(() => {
            if (this.videoEl) {
                this.videoEl.pause();
            }
        }, this.data.gracePeriod);
    },

    remove: function () {
        this.el.removeEventListener('targetFound', this.onTargetFound);
        this.el.removeEventListener('targetLost', this.onTargetLost);
    }
});

/**
 * Scene Generator Component
 * Procedurally generates AR targets and assets from the config.
 */
AFRAME.registerComponent('scene-generator', {
    init: function () {
        const assetsContainer = document.querySelector('a-assets');
        const sceneEl = this.el;

        AR_CONTENT.forEach((item, index) => {
            const videoId = `video-${index}`;

            // 1. Create Video Asset
            const videoEl = document.createElement('video');
            videoEl.setAttribute('id', videoId);
            videoEl.setAttribute('src', item.videoSrc);
            videoEl.setAttribute('preload', 'auto');
            videoEl.setAttribute('loop', 'true');
            videoEl.setAttribute('playsinline', 'true');
            videoEl.setAttribute('webkit-playsinline', 'true');
            videoEl.setAttribute('crossorigin', 'anonymous');
            assetsContainer.appendChild(videoEl);

            // 2. Create AR Target Entity
            const targetEl = document.createElement('a-entity');
            targetEl.setAttribute('mindar-image-target', `targetIndex: ${index}`);
            targetEl.setAttribute('video-controller', `videoSelector: #${videoId}`);

            // 3. Create Video Overlay Plane
            const aVideoEl = document.createElement('a-video');
            aVideoEl.setAttribute('src', `#${videoId}`);
            aVideoEl.setAttribute('width', '1');
            aVideoEl.setAttribute('height', item.height);
            // Center it
            aVideoEl.setAttribute('position', '0 0 0');

            targetEl.appendChild(aVideoEl);
            sceneEl.appendChild(targetEl);
        });
    }
});
