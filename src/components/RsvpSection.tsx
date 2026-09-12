import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, Phone, Heart, Sparkles } from 'lucide-react';
import { COUPLE_DATA } from '../data/weddingData';
import { RsvpFormData } from '../types/wedding';
import { submitRsvp } from '../services/sheetService';

export const RsvpSection: React.FC = () => {
  const [form, setForm] = useState<RsvpFormData>({
    fullName: '', email: '', phone: '', attending: 'yes', guestCount: 1, dietaryNotes: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    await submitRsvp(form);

    setSubmitting(false);
    setDone(true);
    try { 
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#D4AF37', '#6B0D25', '#F4C2C2', '#FFFFFF'] }); 
    } catch {}
  };

  return (
    <section id="rsvp" className="section section-blush">
      <div className="container">
        <div className="section-header">
          <div className="label"><Heart size={14} /> Celebrate With Us <Heart size={14} /></div>
          <h2 className="heading-lg">RSVP & Reservation</h2>
          <p className="body-text">Please respond by October 1st, 2026 to help us finalize our guest list.</p>
          <div className="gold-line" />
        </div>

        <div className="card card-gold rsvp-card">
          <div className="card-body" style={{ padding: 36 }}>
            {done ? (
              <div className="rsvp-success">
                <div className="rsvp-success-icon"><CheckCircle2 size={28} /></div>
                <div className="heading-lg" style={{ marginBottom: 8 }}>RSVP Received!</div>
                <p className="body-text" style={{ maxWidth: 420, margin: '0 auto' }}>
                  Thank you, <strong style={{ color: 'var(--burgundy)' }}>{form.fullName}</strong>. We've recorded your response for <strong>{form.guestCount} guest(s)</strong>. See you October 10th!
                </p>
                <button onClick={() => setDone(false)} className="btn btn-outline btn-sm" style={{ marginTop: 20 }}>Submit Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="rsvp-toggle">
                  <button type="button" className={`rsvp-toggle-btn ${form.attending === 'yes' ? 'active-yes' : ''}`} onClick={() => setForm({ ...form, attending: 'yes' })}>
                    <Sparkles size={16} /> Joyfully Accepts
                  </button>
                  <button type="button" className={`rsvp-toggle-btn ${form.attending === 'no' ? 'active-no' : ''}`} onClick={() => setForm({ ...form, attending: 'no' })}>
                    Regretfully Declines
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Chief & Lolo Emeka Eze" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-input" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 08012345678" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email (Optional)</label>
                    <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number of Guests</label>
                    <select className="form-input" value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })}>
                      <option value={1}>1 Guest (Just Me)</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={5}>5 Guests (Family)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warm Wishes / Notes</label>
                  <textarea className="form-input" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Share a note or dietary preferences..." />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                  <Send size={16} /> {submitting ? 'Sending RSVP...' : 'Confirm RSVP'}
                </button>
              </form>
            )}

            <div className="rsvp-hotlines">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--burgundy)', fontSize: '0.82rem', fontWeight: 600 }}>
                <Phone size={16} /> RSVP Hotlines:
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{COUPLE_DATA.rsvpHotlines.join(' • ')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
