import React from 'react';
import { Church, PartyPopper, Utensils, Clock, MapPin, ExternalLink, CalendarPlus, Sparkles } from 'lucide-react';
import { EVENTS } from '../data/weddingData';

export const ScheduleSection: React.FC = () => {
  const downloadIcs = (evtId: string, title: string, venue: string, addr: string) => {
    let dtStart = '20261010T100000Z';
    let dtEnd = '20261010T170000Z';

    if (evtId === 'meet_greet' || evtId === 'marathon') {
      dtStart = '20261009T160000Z'; // 5:00 PM West Africa Time (UTC+1)
      dtEnd = '20261009T220000Z';
    }

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title} - #OPENLILY2026\nLOCATION:${venue}, ${addr}\nDTSTART:${dtStart}\nDTEND:${dtEnd}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s/g, '_')}_OPENLILY2026.ics`;
    a.click();
  };

  const renderIcon = (iconName: string) => {
    if (iconName === 'Utensils') return <Utensils size={24} />;
    if (iconName === 'Church') return <Church size={24} />;
    return <PartyPopper size={24} />;
  };

  return (
    <section id="schedule" className="section">
      <div className="container">
        <div className="section-header">
          <div className="label"><Sparkles size={14} /> Celebration Weekend <Sparkles size={14} /></div>
          <h2 className="heading-lg">Events & Schedule</h2>
          <p className="body-text">Join us Friday 9th & Saturday 10th October 2026 as we celebrate our union in Enugu Metropolis.</p>
          <div className="gold-line" />
        </div>

        <div className="schedule-grid">
          {EVENTS.map((evt) => (
            <div key={evt.id} className="card schedule-card">
              <div className="schedule-card-ribbon" />
              <div className="card-body" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className="schedule-icon">
                    {renderIcon(evt.icon)}
                  </div>
                  <div className="badge badge-burgundy">{evt.time}</div>
                </div>

                <div className="label" style={{ color: 'var(--blush)', marginBottom: 4 }}>{evt.subtitle}</div>
                <div className="heading-md" style={{ marginBottom: 8 }}>{evt.title}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--burgundy)', marginBottom: 8 }}>
                  📅 {evt.date}
                </div>
                <p className="small-text" style={{ marginBottom: 16 }}>{evt.description}</p>

                <div className="schedule-venue">
                  <div className="schedule-venue-name"><MapPin size={16} /> {evt.venue}</div>
                  <div className="schedule-venue-addr">{evt.address}, {evt.city}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 26, marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> {evt.id === 'meet_greet' ? 'Starts 5:00 PM • Casual & Traditional attire' : 'Doors open 30 minutes prior'}
                  </div>
                </div>

                <div className="schedule-actions">
                  <a href={evt.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    <ExternalLink size={14} /> Google Maps
                  </a>
                  <button onClick={() => downloadIcs(evt.id, evt.title, evt.venue, evt.address)} className="btn btn-ghost btn-sm">
                    <CalendarPlus size={14} /> Add to iCal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
