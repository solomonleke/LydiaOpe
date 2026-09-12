import React, { useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';

interface Props { 
  isPlaying: boolean; 
  onToggle: () => void; 
}

export const AudioPlayer: React.FC<Props> = ({ isPlaying, onToggle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
    return () => pauseAudio();
  }, [isPlaying]);

  const playAudio = () => {
    // Attempt HTML5 Audio element first if audio URL is set
    if (audioRef.current && COUPLE_DATA.bgMusicUrl) {
      audioRef.current.play().then(() => {
        // Successfully playing audio file
      }).catch((err) => {
        console.warn('Audio element play failed, using synth fallback:', err);
        startSynth();
      });
    } else {
      startSynth();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
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
      {COUPLE_DATA.bgMusicUrl && (
        <audio 
          ref={audioRef} 
          src={COUPLE_DATA.bgMusicUrl} 
          loop 
          preload="auto"
        />
      )}
      <button 
        onClick={onToggle} 
        className={isPlaying ? 'playing' : ''}
        title={isPlaying ? 'Mute background music' : 'Play background music'}
      >
        <Music size={16} />
        <span>{isPlaying ? 'Playing' : 'Music'}</span>
        {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </button>
    </div>
  );
};
