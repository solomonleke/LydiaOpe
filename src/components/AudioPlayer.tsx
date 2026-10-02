import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';

interface Props { 
  isPlaying: boolean; 
  onToggle: () => void; 
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export const AudioPlayer: React.FC<Props> = ({ isPlaying, onToggle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [ytReady, setYtReady] = useState(false);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  const youtubeId = useMemo(() => {
    if (!COUPLE_DATA.bgMusicUrl) return null;
    const match = COUPLE_DATA.bgMusicUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }, []);

  // Initialize YouTube IFrame API if background URL is a YouTube link
  useEffect(() => {
    if (!youtubeId) return;

    const initYT = () => {
      if (window.YT && window.YT.Player) {
        createYTPlayer();
      } else {
        if (!document.getElementById('yt-api-script')) {
          const tag = document.createElement('script');
          tag.id = 'yt-api-script';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
        const prevOnReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevOnReady) prevOnReady();
          createYTPlayer();
        };
      }
    };

    const createYTPlayer = () => {
      if (ytPlayerRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('yt-bg-player', {
          height: '1',
          width: '1',
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: youtubeId,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              setYtReady(true);
            },
          },
        });
      } catch (err) {
        console.warn('Failed to initialize YouTube player:', err);
      }
    };

    initYT();
  }, [youtubeId]);

  useEffect(() => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
    return () => pauseAudio();
  }, [isPlaying, ytReady]);

  const playAudio = () => {
    if (youtubeId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.playVideo();
      }
    } else if (audioRef.current && COUPLE_DATA.bgMusicUrl) {
      audioRef.current
        .play()
        .then(() => {})
        .catch((err) => {
          console.warn('Audio element play failed, using synth fallback:', err);
          startSynth();
        });
    } else {
      startSynth();
    }
  };

  const pauseAudio = () => {
    if (youtubeId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    stopSynth();
  };

  // Web Audio Synth Fallback
  const startSynth = () => {
    if (synthCtxRef.current) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      synthCtxRef.current = ctx;
      const notes = [261.63, 329.63, 392, 440, 493.88, 523.25];
      let step = 0;
      synthIntervalRef.current = window.setInterval(() => {
        if (!synthCtxRef.current || synthCtxRef.current.state === 'closed') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[step % notes.length], ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.9);
        step++;
      }, 1200);
    } catch {}
  };

  const stopSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthCtxRef.current) {
      synthCtxRef.current.close();
      synthCtxRef.current = null;
    }
  };

  return (
    <div className="audio-fab">
      {youtubeId ? (
        <div 
          id="yt-bg-player" 
          style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }} 
        />
      ) : (
        COUPLE_DATA.bgMusicUrl && (
          <audio ref={audioRef} src={COUPLE_DATA.bgMusicUrl} loop preload="auto" />
        )
      )}
      <button 
        onClick={onToggle} 
        className={isPlaying ? 'playing' : ''}
        title={isPlaying ? 'Mute background music' : 'Play "All of Me" by John Legend'}
      >
        <Music size={16} />
        <span>{isPlaying ? 'Playing' : 'Music'}</span>
        {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
    </div>
  );
};
