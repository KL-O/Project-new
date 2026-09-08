// LUT Generator — shared image/video loading
// Normalizes an uploaded image OR video file into the same shape so every
// downstream consumer (analysis, preview, thumbnails) can call
// ctx.drawImage(media.element, ...) without caring which it got.

function isVideoFile(file) {
  return file.type.startsWith('video/');
}

function loadMedia(file) {
  if (isVideoFile(file)) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.addEventListener('loadedmetadata', () => {
        const seekTo = Math.min(video.duration / 2, Math.max(0, video.duration - 0.05));
        seekVideoTo(video, seekTo).then(() => {
          resolve({ type: 'video', element: video, naturalWidth: video.videoWidth, naturalHeight: video.videoHeight, duration: video.duration });
        });
      }, { once: true });
      video.addEventListener('error', reject, { once: true });
      video.src = URL.createObjectURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ type: 'image', element: img, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function seekVideoTo(videoEl, time) {
  return new Promise((resolve) => {
    const clamped = Math.max(0, Math.min(time, videoEl.duration - 0.01));
    const onSeeked = () => {
      videoEl.removeEventListener('seeked', onSeeked);
      resolve();
    };
    videoEl.addEventListener('seeked', onSeeked);
    videoEl.currentTime = clamped;
  });
}

// Draws the media (at its current frame, for video) onto canvas, scaled so
// its longest side is at most maxWidth. Returns the 2D context.
function drawMediaToCanvas(media, canvas, maxWidth) {
  const scale = Math.min(1, maxWidth / media.naturalWidth);
  const w = Math.max(1, Math.round(media.naturalWidth * scale));
  const h = Math.max(1, Math.round(media.naturalHeight * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(media.element, 0, 0, w, h);
  return ctx;
}

window.MediaLoader = { isVideoFile, loadMedia, seekVideoTo, drawMediaToCanvas };
