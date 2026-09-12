import React from 'react';
import { Heart, ArrowUp } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" style={{ position: 'relative' }}>
      <div className="container">
        <div className="footer-brand">Ezinne & Opeyemi</div>
        <div className="footer-sub">{COUPLE_DATA.hashtag} • Saturday, October 10th, 2026</div>
        <p className="footer-quote">"What God has joined together, let no man put asunder." — Matthew 19:6</p>
        <div style={{ width: 48, height: 2, background: 'var(--gold)', margin: '16px auto', borderRadius: 1 }} />
        <div className="footer-bottom">
          <span>© 2026 Ezinne & Opeyemi. All rights reserved.</span>
          <div className="footer-love">Made with <Heart size={12} style={{ color: 'var(--gold-light)' }} /> for #OPENLILY2026</div>
        </div>
      </div>
      <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <ArrowUp size={18} />
      </button>
    </footer>
  );
};
