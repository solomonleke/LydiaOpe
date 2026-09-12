import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';

export const OurStory: React.FC = () => {
  return (
    <section id="story" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <div className="label"><Sparkles size={14} /> Our Journey To Forever <Sparkles size={14} /></div>
          <h2 className="heading-lg">Our Love Story</h2>
          <div className="gold-line" />
        </div>

        <div className="family-card">
          <div className="family-item">
            <div className="label" style={{ color: 'var(--gold-dark)' }}>Bride's Family</div>
            <div className="heading-sm">{COUPLE_DATA.bride.parents}</div>
          </div>
          <div className="family-item">
            <div className="label" style={{ color: 'var(--gold-dark)' }}>Groom's Family</div>
            <div className="heading-sm">{COUPLE_DATA.groom.parents}</div>
          </div>
        </div>

        <div className="couple-grid">
          <div className="couple-card">
            <div className="couple-photo">
              <img src={COUPLE_DATA.bride.photo} alt={COUPLE_DATA.bride.name} />
            </div>
            <div className="label" style={{ color: 'var(--blush)', marginBottom: 4 }}>The Bride</div>
            <div className="heading-md" style={{ color: 'var(--burgundy)' }}>{COUPLE_DATA.bride.name}</div>
            <p className="small-text" style={{ marginTop: 8, fontStyle: 'italic' }}>"{COUPLE_DATA.bride.bio}"</p>
          </div>
          <div className="couple-card">
            <div className="couple-photo">
              <img src={COUPLE_DATA.groom.photo} alt={COUPLE_DATA.groom.name} />
            </div>
            <div className="label" style={{ color: 'var(--blush)', marginBottom: 4 }}>The Groom</div>
            <div className="heading-md" style={{ color: 'var(--burgundy)' }}>{COUPLE_DATA.groom.name}</div>
            <p className="small-text" style={{ marginTop: 8, fontStyle: 'italic' }}>"{COUPLE_DATA.groom.bio}"</p>
          </div>
        </div>

        <div className="timeline">
          {COUPLE_DATA.story.map((item) => (
            <div key={item.title} className="timeline-item">
              <div className="timeline-dot"><Heart size={12} /></div>
              <div className="timeline-content">
                <div className="badge badge-gold" style={{ marginBottom: 8 }}>{item.year}</div>
                <div className="heading-sm" style={{ marginBottom: 6 }}>{item.title}</div>
                <p className="small-text">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
