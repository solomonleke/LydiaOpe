import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Hotel } from 'lucide-react';
import { FAQS } from '../data/weddingData';

export const FaqSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faqs" className="section section-alt">
      <div className="container-sm">
        <div className="section-header">
          <div className="label"><HelpCircle size={14} /> Useful Details <HelpCircle size={14} /></div>
          <h2 className="heading-lg">Travel & FAQs</h2>
          <p className="body-text">Everything you need to know for #OPENLILY2026 in Enugu.</p>
          <div className="gold-line" />
        </div>

        <div className="faq-hotel">
          <div className="faq-hotel-icon"><Hotel size={26} /></div>
          <div>
            <div className="label" style={{ color: 'var(--gold-dark)', marginBottom: 2 }}>Recommended Stay</div>
            <div className="heading-sm">Decastle Hotel & Resort (Reception Venue)</div>
            <p className="small-text" style={{ marginTop: 4 }}>Discounted guest rooms available for out-of-town guests traveling to Enugu GRA.</p>
          </div>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <div key={faq.question} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{faq.question}</span>
                {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {open === i && <div className="faq-answer">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
