import React, { useState, useEffect } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/weddingData';

export const GallerySection: React.FC = () => {
  const [cat, setCat] = useState('all');
  const [selected, setSelected] = useState<number | null>(null);

  const cats = [
    { id: 'all', label: 'All Photos' },
    { id: 'proposal', label: 'The Proposal' },
    { id: 'traditional', label: 'Traditional' },
    { id: 'romantic', label: 'Romantic' },
    { id: 'candid', label: 'Candid' },
  ];

  const filtered = GALLERY_IMAGES.filter((p) => cat === 'all' || p.category === cat);

  const next = () => { if (selected !== null) setSelected((selected + 1) % filtered.length); };
  const prev = () => { if (selected !== null) setSelected((selected - 1 + filtered.length) % filtered.length); };
  const close = () => setSelected(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected === null) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, filtered.length]);

  return (
    <section id="gallery" className="section section-blush">
      <div className="container">
        <div className="section-header">
          <div className="label"><Camera size={14} /> Moments Frozen In Time <Camera size={14} /></div>
          <h2 className="heading-lg">Pre-Wedding Gallery</h2>
          <p className="body-text">Explore our captivating pre-wedding shoot in rich traditional Isiagu velvet and modern attire.</p>
          <div className="gold-line" />
        </div>

        <div className="gallery-filters">
          {cats.map((c) => (
            <button key={c.id} className={`gallery-filter ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {filtered.map((photo, i) => (
            <div key={photo.id} className="gallery-item" onClick={() => setSelected(i)}>
              <img src={photo.url} alt={photo.title} loading="lazy" />
              <div className="gallery-item-overlay">
                <div className="label" style={{ color: 'var(--gold-light)', marginBottom: 4 }}>{photo.category}</div>
                <div className="gallery-item-title">{photo.title}</div>
                {photo.description && <div className="gallery-item-desc">{photo.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--gold-light)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <ZoomIn size={14} /> View Fullscreen
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected !== null && (
        <div className="lightbox" onClick={close}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={close}><X size={20} /></button>
            <button className="lightbox-nav lightbox-prev" onClick={prev}><ChevronLeft size={22} /></button>
            <button className="lightbox-nav lightbox-next" onClick={next}><ChevronRight size={22} /></button>
            <img src={filtered[selected].url} alt={filtered[selected].title} />
            <div className="lightbox-caption">
              <div className="label">{selected + 1} of {filtered.length}</div>
              <div className="heading-sm" style={{ color: 'white' }}>{filtered[selected].title}</div>
              <p className="small-text" style={{ color: 'rgba(255,255,255,0.7)' }}>{filtered[selected].description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
