import React, { useState, useEffect } from 'react';
import { Heart, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';

interface NavbarProps {
  isPlaying: boolean;
  onToggleAudio: () => void;
  onOpenRegistry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isPlaying, onToggleAudio, onOpenRegistry }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'Our Story', href: '#story' },
    { name: 'Official IV', href: '#invitation' },
    { name: 'Schedule', href: '#schedule' },
    { name: 'Dress Code', href: '#colors' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Memories', href: '#memories' },
    { name: 'FAQs', href: '#faqs' },
    { name: 'RSVP', href: '#rsvp' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="#" className="navbar-brand">
            <div className="navbar-brand-icon">
              <Heart size={16} />
            </div>
            <div>
              <span className="navbar-brand-text">Ezinne & Opeyemi</span>
              <span className="navbar-brand-sub">{COUPLE_DATA.hashtag}</span>
            </div>
          </a>

          <div className="navbar-links">
            {links.map((l) => (
              <a key={l.name} href={l.href} className="navbar-link">{l.name}</a>
            ))}
          </div>

          <div className="navbar-actions">
            <button onClick={onToggleAudio} className="btn btn-icon btn-ghost" title="Toggle Music">
              {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={onOpenRegistry} className="btn btn-sm btn-outline" style={{ display: 'none' }}>
              Gift Registry
            </button>
            <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mobile-menu">
          {links.map((l) => (
            <a key={l.name} href={l.href} className="mobile-menu-link" onClick={() => setMobileOpen(false)}>
              {l.name}
            </a>
          ))}
          <button onClick={() => { onOpenRegistry(); setMobileOpen(false); }} className="btn btn-primary" style={{ marginTop: 16 }}>
            Gift Registry
          </button>
        </div>
      )}
    </>
  );
};
