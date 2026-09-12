import React, { useState } from 'react';
import { Palette, Copy, Check, Shirt } from 'lucide-react';
import { COLORS } from '../data/weddingData';

export const DressCodeSection: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="colors" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="label"><Palette size={14} /> Fashion & Theme <Palette size={14} /></div>
          <h2 className="heading-lg">Colour of the Day</h2>
          <p className="body-text">We invite guests to dress in elegant traditional or formal attire styled in our official color palette.</p>
          <div className="gold-line" />
        </div>

        <div className="colors-grid">
          {COLORS.map((c) => (
            <div key={c.name} className="color-swatch-card">
              <div
                className="color-swatch"
                style={{ backgroundColor: c.hex, borderColor: c.hex === '#FFFFFF' ? 'var(--border)' : c.hex }}
                onClick={() => handleCopy(c.hex)}
              >
                <button className="btn btn-sm" style={{
                  background: c.textDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
                  color: c.textDark ? 'white' : 'var(--burgundy)',
                  fontSize: '0.7rem'
                }}>
                  {copied === c.hex ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> {c.hex}</>}
                </button>
              </div>
              <div className="heading-sm" style={{ fontSize: '0.95rem', marginBottom: 2 }}>{c.name}</div>
              <p className="small-text">{c.description}</p>
            </div>
          ))}
        </div>

        <div className="dress-tip">
          <div className="dress-tip-icon"><Shirt size={22} /></div>
          <div>
            <div className="heading-sm" style={{ marginBottom: 6 }}>Guest Attire Inspiration</div>
            <p className="small-text">
              <strong>Gentlemen:</strong> Agbada, Senator suits, or Black-Tie tuxedos with Burgundy or Gold pocket squares.<br />
              <strong>Ladies:</strong> Luxurious Aso-Ebi lace or tailored evening gowns in Burgundy, Blush Pink, or Champagne Gold with statement gele.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
