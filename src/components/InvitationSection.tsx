import React from 'react';
import { Download, Eye, X, ZoomIn, Calendar, MapPin, Phone, Palette } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';

interface Props {
  isOpenModal: boolean;
  onToggleModal: (open: boolean) => void;
}

export const InvitationSection: React.FC<Props> = ({ isOpenModal, onToggleModal }) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = COUPLE_DATA.ivImageUrl;
    a.download = 'Official_Invitation_Ezinne_and_Opeyemi_2026.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section id="invitation" className="section section-blush">
      <div className="container">
        <div className="section-header">
          <div className="label">Official Wedding Pass</div>
          <h2 className="heading-lg">The Official Invitation</h2>
          <p className="body-text">View our official invitation card below or download it directly for your perusal and entry.</p>
          <div className="gold-line" />
        </div>

        <div className="iv-layout">
          <div className="iv-frame" onClick={() => onToggleModal(true)}>
            <img src={COUPLE_DATA.ivImageUrl} alt="Official Wedding Invitation #OPENLILY2026" />
            <div className="iv-frame-overlay">
              <button className="btn btn-gold btn-sm"><Eye size={16} /> View</button>
              <button className="btn btn-sm" style={{ background: 'white', color: 'var(--burgundy)' }} onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                <Download size={16} /> Download
              </button>
            </div>
          </div>

          <div className="iv-details">
            <div className="badge badge-gold">{COUPLE_DATA.hashtag}</div>
            <div className="heading-md">Ezinne Lydia Ezeh & Opeyemi Noah Adeleke</div>
            <p className="small-text">Holy Matrimony & Reception Celebrations</p>

            <div className="iv-detail-row">
              <div className="iv-detail-icon"><Calendar size={18} /></div>
              <div className="iv-detail-text">
                <div className="heading-sm" style={{ fontSize: '0.9rem' }}>Date & Time</div>
                <p className="small-text">{COUPLE_DATA.weddingDateFormatted} • 11:00 AM</p>
              </div>
            </div>
            <div className="iv-detail-row">
              <div className="iv-detail-icon"><MapPin size={18} /></div>
              <div className="iv-detail-text">
                <div className="heading-sm" style={{ fontSize: '0.9rem' }}>Venues</div>
                <p className="small-text">Church: Mater Dei Parish, Trans-Ekulu<br />Reception: Decastle Hotel, Enugu GRA</p>
              </div>
            </div>
            <div className="iv-detail-row">
              <div className="iv-detail-icon"><Palette size={18} /></div>
              <div className="iv-detail-text">
                <div className="heading-sm" style={{ fontSize: '0.9rem' }}>Colour of the Day</div>
                <p className="small-text">Burgundy, Blush Pink, Champagne Gold & White</p>
              </div>
            </div>
            <div className="iv-detail-row">
              <div className="iv-detail-icon"><Phone size={18} /></div>
              <div className="iv-detail-text">
                <div className="heading-sm" style={{ fontSize: '0.9rem' }}>RSVP Hotlines</div>
                <p className="small-text">{COUPLE_DATA.rsvpHotlines.join(' • ')}</p>
              </div>
            </div>

            <div className="iv-actions">
              <button onClick={handleDownload} className="btn btn-primary"><Download size={16} /> Download IV (JPG)</button>
              <button onClick={() => onToggleModal(true)} className="btn btn-outline btn-sm"><ZoomIn size={16} /> View Full Size</button>
            </div>
          </div>
        </div>
      </div>

      {isOpenModal && (
        <div className="lightbox" onClick={() => onToggleModal(false)}>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => onToggleModal(false)}><X size={20} /></button>
            <img src={COUPLE_DATA.ivImageUrl} alt="Official Invitation Card" />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button onClick={handleDownload} className="btn btn-gold btn-sm"><Download size={16} /> Download IV</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
