import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, Image, Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import { INITIAL_MEMORIES } from '../data/weddingData';
import { MemoryPost } from '../types/wedding';
import { submitBlessing, fetchBlessings } from '../services/sheetService';

export const MemoryWallSection: React.FC = () => {
  const [memories, setMemories] = useState<MemoryPost[]>(INITIAL_MEMORIES);
  const [tab, setTab] = useState<'guestbook' | 'vault'>('guestbook');
  const [author, setAuthor] = useState('');
  const [rel, setRel] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchBlessings(INITIAL_MEMORIES).then((data) => {
      if (isMounted) {
        setMemories(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleLike = (id: string) => {
    setMemories(memories.map((m) => m.id === id ? { ...m, likes: m.likes + 1 } : m));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !msg) return;
    setSubmitting(true);

    const newBlessing = await submitBlessing({
      author,
      relationship: rel,
      message: msg,
    });

    setMemories([newBlessing, ...memories]);
    setAuthor('');
    setRel('');
    setMsg('');
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="memories" className="section">
      <div className="container">
        <div className="section-header">
          <div className="label"><Sparkles size={14} /> Memories & Well Wishes <Sparkles size={14} /></div>
          <h2 className="heading-lg">Memory Wall & Guestbook</h2>
          <p className="body-text">Leave your loving thoughts for the couple. Your messages are saved for Lydia & Ope!</p>
          <div className="gold-line" />
        </div>

        <div className="memory-tabs">
          <div className="memory-tab-group">
            <button className={`memory-tab ${tab === 'guestbook' ? 'active' : ''}`} onClick={() => setTab('guestbook')}>
              <MessageSquare size={16} /> Digital Guestbook ({memories.length})
            </button>
            <button className={`memory-tab ${tab === 'vault' ? 'active' : ''}`} onClick={() => setTab('vault')}>
              <Image size={16} /> Wedding Memories
            </button>
          </div>
        </div>

        {tab === 'guestbook' ? (
          <div className="memory-layout">
            <div className="card memory-form">
              <div className="card-body" style={{ padding: 28 }}>
                <div className="heading-md" style={{ marginBottom: 4 }}>Leave a Blessing</div>
                <p className="small-text" style={{ marginBottom: 20 }}>Share prayers, advice, or a favourite memory for the couple.</p>

                {submitted && <div className="toast">✨ Your warm wish has been saved to the Guestbook!</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="form-input" required value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Aunt Blessing Ezeh" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input className="form-input" value={rel} onChange={(e) => setRel(e.target.value)} placeholder="e.g. Bride's Cousin / Groom's Friend" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Message *</label>
                    <textarea className="form-input" required rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="May your home be filled with endless joy and laughter..." />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                    <Send size={16} /> {submitting ? 'Saving Wish...' : 'Post Wish to Wall'}
                  </button>
                </form>
              </div>
            </div>

            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--burgundy)' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
                  <p className="small-text">Loading blessings from Guestbook...</p>
                </div>
              ) : (
                memories.map((p) => (
                  <div key={p.id} className="memory-post">
                    <div className="memory-post-header">
                      <div className="memory-post-author">
                        <div className="memory-post-avatar">{p.author.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="heading-sm" style={{ fontSize: '0.95rem' }}>{p.author}</div>
                          <div className="small-text" style={{ fontSize: '0.72rem', color: 'var(--gold-dark)' }}>{p.relationship}</div>
                        </div>
                      </div>
                      <span className="small-text" style={{ fontSize: '0.7rem' }}>{p.date}</span>
                    </div>
                    <div className="memory-post-message">"{p.message}"</div>
                    <div className="memory-post-footer">
                      <button className="memory-like-btn" onClick={() => handleLike(p.id)}>
                        <ThumbsUp size={14} /> {p.likes} Blessings
                      </button>
                      <span className="small-text" style={{ fontSize: '0.68rem' }}>#OPENLILY2026</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="card card-gold">
            <div className="memory-vault">
              <div className="memory-vault-icon"><ImagePlus size={28} /></div>
              <div className="heading-md" style={{ marginBottom: 8 }}>Wedding Memory Vault</div>
              <p className="body-text" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
                This gallery will store magical moments from the ceremony. Check back after October 10th, 2026!
              </p>
              <div className="badge badge-gold"><Sparkles size={12} /> Ready for post-wedding uploads</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
