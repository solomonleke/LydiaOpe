import React, { useState, useEffect } from 'react';
import { Church, PartyPopper, Trophy, Utensils, Clock, MapPin, ExternalLink, CalendarPlus, Sparkles, Navigation, Map, Vote, CheckCircle2, Flame, Loader2 } from 'lucide-react';
import { EVENTS } from '../data/weddingData';
import { PollOptionId, PollResultData } from '../types/wedding';
import { getUserPollVote, fetchPollResults, submitPollVote } from '../services/sheetService';

export const ScheduleSection: React.FC = () => {
  const [userVote, setUserVote] = useState<PollOptionId | null>(getUserPollVote());
  const [selectedOption, setSelectedOption] = useState<PollOptionId | null>(null);
  const [pollResults, setPollResults] = useState<PollResultData>({
    participate: 0,
    unavailable: 0,
    total: 0,
    participatePct: 0,
    unavailablePct: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPollResults().then((res) => {
      setPollResults(res);
    });
  }, []);

  const handleVoteSubmit = async () => {
    if (!selectedOption || isSubmitting) return;
    setIsSubmitting(true);
    const response = await submitPollVote(selectedOption);
    setUserVote(selectedOption);
    setPollResults(response.results);
    setIsSubmitting(false);
  };

  const downloadIcs = (evtId: string, title: string, venue: string, addr: string) => {
    let dtStart = '20261010T100000Z';
    let dtEnd = '20261010T170000Z';

    if (evtId === 'marathon') {
      dtStart = '20261009T053000Z'; // Friday 6:30 AM
      dtEnd = '20261009T090000Z';
    } else if (evtId === 'meet_greet') {
      dtStart = '20261009T160000Z'; // Friday 5:00 PM
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
    if (iconName === 'Trophy') return <Trophy size={24} />;
    if (iconName === 'Utensils') return <Utensils size={24} />;
    if (iconName === 'Church') return <Church size={24} />;
    return <PartyPopper size={24} />;
  };

  const getVenueNote = (evtId: string) => {
    if (evtId === 'marathon') return 'Gathering & warm-ups 15 mins prior';
    if (evtId === 'meet_greet') return 'Starts 5:00 PM • Casual & Traditional attire';
    return 'Doors open 30 minutes prior';
  };

  // Find marathon event data for the route section
  const marathonEvent = EVENTS.find(e => e.id === 'marathon');
  const hasVoted = Boolean(userVote);

  return (
    <section id="schedule" className="section">
      <div className="container">
        <div className="section-header">
          <div className="label"><Sparkles size={14} /> Celebration Weekend <Sparkles size={14} /></div>
          <h2 className="heading-lg">Events &amp; Schedule</h2>
          <p className="body-text">Join us Friday 9th &amp; Saturday 10th October 2026 for 4 memorable events celebrating our union in Enugu.</p>
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
                    <Clock size={14} /> {getVenueNote(evt.id)}
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

        {/* ── Marathon Route Map & Poll Section ── */}
        {marathonEvent && marathonEvent.routePoints && (
          <div className="marathon-route-section">
            <div className="marathon-route-header">
              <div className="label"><Trophy size={14} /> 10km Marathon Route <Trophy size={14} /></div>
              <div className="heading-md">Race Day Route Map</div>
              <div className="marathon-distance-badge">
                <Navigation size={16} />
                {marathonEvent.distanceFromHotel || '~4.5 km from Decastle Hotel GRA (approx. 8 min drive)'}
              </div>
            </div>

            {/* 3 Route Points with Connectors */}
            <div className="route-points-row">
              <div className="route-point">
                <div className="route-point-icon point-hotel">🏨</div>
                <div className="route-point-label">{marathonEvent.routePoints.p1Label}</div>
                <div className="route-point-name">{marathonEvent.routePoints.p1Name}</div>
              </div>
              <div className="route-connector" />
              <div className="route-point">
                <div className="route-point-icon point-start">🚩</div>
                <div className="route-point-label">{marathonEvent.routePoints.p2Label}</div>
                <div className="route-point-name">{marathonEvent.routePoints.p2Name}</div>
              </div>
              <div className="route-connector" />
              <div className="route-point">
                <div className="route-point-icon point-finish">🏆</div>
                <div className="route-point-label">{marathonEvent.routePoints.p3Label}</div>
                <div className="route-point-name">{marathonEvent.routePoints.p3Name}</div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="route-map-container">
              <div className="route-map-overlay-label">
                <Map size={12} /> Live Route
              </div>
              <iframe
                title="Marathon Route Map"
                src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d15867.5!2d7.49!3d6.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x1044a45f5b0a1b1d%3A0xdecastle!2sDecastle+Hotel+and+Resort%2C+GRA%2C+Enugu!3m2!1d6.4441!2d7.5004!4m5!1s0x1044a3c5e0c77777%3A0xokpara!2sOkpara+Square%2C+Independence+Layout%2C+Enugu!3m2!1d6.4530!2d7.5100!5e0!3m2!1sen!2sng!4v1"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a
                href={marathonEvent.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <ExternalLink size={14} /> Open Full 3-Point Route in Google Maps
              </a>
            </div>

            {/* ── 10km Marathon Participation Poll ── */}
            <div className="marathon-poll-container" id="marathon-poll">
              <div className="marathon-poll-header">
                <div className="marathon-poll-badge">
                  <Vote size={14} /> Event Poll
                </div>
                <h3 className="marathon-poll-title">Are you running with us on Friday morning?</h3>
                <p className="marathon-poll-sub">
                  Cast your vote below to help us plan water stations, warm-up energy kits, and finish-line refreshments!
                </p>
              </div>

              {hasVoted ? (
                <div className="marathon-poll-results">
                  <div className="poll-voted-notice">
                    <CheckCircle2 size={18} />
                    <span>Your vote is recorded: <strong>{userVote === 'participate' ? 'I will participate 🏃‍♂️' : 'I will not be available 💛'}</strong></span>
                  </div>

                  <div className="poll-bars-list">
                    {/* Option 1: Participate */}
                    <div className={`poll-bar-item ${userVote === 'participate' ? 'user-selected' : ''}`}>
                      <div className="poll-bar-meta">
                        <span className="poll-option-title">
                          🏃‍♂️ I will participate {userVote === 'participate' && <span className="your-vote-tag">Your Vote</span>}
                        </span>
                        <span className="poll-option-percent">{pollResults.participatePct}% ({pollResults.participate} votes)</span>
                      </div>
                      <div className="poll-progress-track">
                        <div
                          className="poll-progress-fill fill-participate"
                          style={{ width: `${pollResults.participatePct}%` }}
                        />
                      </div>
                    </div>

                    {/* Option 2: Not available */}
                    <div className={`poll-bar-item ${userVote === 'unavailable' ? 'user-selected' : ''}`}>
                      <div className="poll-bar-meta">
                        <span className="poll-option-title">
                          💛 I will not be available {userVote === 'unavailable' && <span className="your-vote-tag">Your Vote</span>}
                        </span>
                        <span className="poll-option-percent">{pollResults.unavailablePct}% ({pollResults.unavailable} votes)</span>
                      </div>
                      <div className="poll-progress-track">
                        <div
                          className="poll-progress-fill fill-unavailable"
                          style={{ width: `${pollResults.unavailablePct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="poll-total-count">
                    <Flame size={14} /> Total votes cast: <strong>{pollResults.total}</strong>
                  </div>
                </div>
              ) : (
                <div className="marathon-poll-options-wrapper">
                  <div className="poll-options-grid">
                    <button
                      type="button"
                      className={`poll-option-card ${selectedOption === 'participate' ? 'active' : ''}`}
                      onClick={() => setSelectedOption('participate')}
                    >
                      <div className="poll-option-radio">
                        <div className="poll-option-radio-inner" />
                      </div>
                      <div className="poll-option-text">
                        <div className="poll-option-heading">🏃‍♂️ I will participate</div>
                        <div className="poll-option-desc">Count me in! I'll be at Okpara Square ready to run.</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`poll-option-card ${selectedOption === 'unavailable' ? 'active' : ''}`}
                      onClick={() => setSelectedOption('unavailable')}
                    >
                      <div className="poll-option-radio">
                        <div className="poll-option-radio-inner" />
                      </div>
                      <div className="poll-option-text">
                        <div className="poll-option-heading">💛 I will not be available</div>
                        <div className="poll-option-desc">I won't be able to run, but I'll be cheering for you!</div>
                      </div>
                    </button>
                  </div>

                  <div className="poll-action-bar">
                    <button
                      type="button"
                      className="btn btn-primary poll-submit-btn"
                      disabled={!selectedOption || isSubmitting}
                      onClick={handleVoteSubmit}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Vote size={16} /> Submit Vote
                        </>
                      )}
                    </button>
                    <span className="poll-limit-note">🔒 1 vote per guest</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

