import React, { useState, useEffect } from 'react';
import { Download, Calendar, MapPin, Heart, ChevronDown } from 'lucide-react';
import { COUPLE_DATA, GALLERY_IMAGES } from '../data/weddingData';
import { Countdown } from './Countdown';

interface HeroProps { onOpenIv: () => void; }

export const Hero: React.FC<HeroProps> = ({ onOpenIv }) => {
  const [slide, setSlide] = useState(0);
  const photos = GALLERY_IMAGES.filter((p) => p.category !== 'proposal').map((p) => p.url);

  useEffect(() => {
    const id = setInterval(() => setSlide((p) => (p + 1) % photos.length), 5000);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <section className="hero">
      <div className="hero-slides">
        {photos.map((src, i) => (
          <div key={src} className={`hero-slide ${i === slide ? 'active' : ''}`}>
            <img src={src} alt="Ezinne & Opeyemi" />
          </div>
        ))}
      </div>
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="badge badge-gold animate-float" style={{ margin: '0 auto 16px' }}>
          <Heart size={12} /> {COUPLE_DATA.hashtag}
        </div>

        <p className="hero-script">Together is a Beautiful Place to Be</p>

        <h1 className="hero-title">
          <span>Ezinne</span>
          <span className="amp">&</span>
          <span>Opeyemi</span>
        </h1>

        <div className="hero-meta">
          <div className="hero-meta-item">
            <Calendar size={16} />
            <span>{COUPLE_DATA.weddingDateFormatted}</span>
          </div>
          <div className="hero-meta-item">
            <MapPin size={16} />
            <span>{COUPLE_DATA.locationCity}</span>
          </div>
        </div>

        <Countdown targetDate={COUPLE_DATA.weddingDateISO} />

        <div className="hero-actions">
          <a href="#rsvp" className="btn btn-primary">RSVP Now</a>
          <button onClick={onOpenIv} className="btn btn-ghost">
            <Download size={16} /> Download Official IV
          </button>
        </div>

        <div className="hero-indicators">
          {photos.map((_, i) => (
            <button key={i} className={`hero-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      </div>

      <a href="#story" className="hero-scroll"><ChevronDown size={24} /></a>
    </section>
  );
};
