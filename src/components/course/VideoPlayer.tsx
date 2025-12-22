import { useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  videoUrl?: string;
  streamingUrl?: string;
  className?: string;
  onProgressUpdate?: (progress: number) => void;
}

export function VideoPlayer({ videoUrl, streamingUrl, className = "", onProgressUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    
    const progress = (video.currentTime / video.duration) * 100;
    onProgressUpdate?.(progress);
  }, [onProgressUpdate]);

  const tryAutoplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
    } catch (err) {
      console.log('Autoplay blocked by browser:', err);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Se tiver URL de streaming (HLS)
    if (streamingUrl) {
      if (streamingUrl.includes('.m3u8')) {
        // HLS streaming
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          
          hlsRef.current = hls;
          hls.loadSource(streamingUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('HLS manifest loaded');
            tryAutoplay();
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari nativo suporta HLS
          video.src = streamingUrl;
          video.addEventListener('loadedmetadata', tryAutoplay, { once: true });
        }
      } else {
        // URL direta de vídeo
        video.src = streamingUrl;
        video.addEventListener('loadedmetadata', tryAutoplay, { once: true });
      }
    } 
    // Se tiver URL de vídeo normal
    else if (videoUrl) {
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', tryAutoplay, { once: true });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, streamingUrl, tryAutoplay]);

  if (!videoUrl && !streamingUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <p className="text-muted-foreground">Nenhum vídeo disponível</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={`w-full h-auto ${className}`}
      controls
      controlsList="nodownload"
      playsInline
      preload="auto"
      onTimeUpdate={handleTimeUpdate}
    >
      Seu navegador não suporta a reprodução de vídeo.
    </video>
  );
}
