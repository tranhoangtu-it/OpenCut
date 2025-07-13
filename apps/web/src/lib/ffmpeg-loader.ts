// Lazy loader for FFmpeg to prevent blocking initial page load
let ffmpegPromise: Promise<typeof import('./ffmpeg-utils')> | null = null;

export const loadFFmpeg = () => {
  if (!ffmpegPromise) {
    ffmpegPromise = import(
      /* webpackChunkName: "ffmpeg" */
      /* webpackPreload: false */
      './ffmpeg-utils'
    );
  }
  return ffmpegPromise;
};

export const preloadFFmpeg = () => {
  // Preload FFmpeg in the background after initial page load
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => loadFFmpeg(), { timeout: 5000 });
  } else {
    setTimeout(() => loadFFmpeg(), 2000);
  }
};