import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  videoUrl?: string;
  streamingUrl?: string;
  className?: string;
}

export function VideoPlayer({ videoUrl, streamingUrl, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

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
            video.play().catch(err => console.log('Autoplay prevented:', err));
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari nativo suporta HLS
          video.src = streamingUrl;
        }
      } else {
        // URL direta de vídeo
        video.src = streamingUrl;
      }
    } 
    // Se tiver URL de vídeo normal
    else if (videoUrl) {
      video.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, streamingUrl]);

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
      preload="metadata"
      autoPlay
      muted
    >
      Seu navegador não suporta a reprodução de vídeo.
    </video>
  );
}
