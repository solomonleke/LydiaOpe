import React, { useState } from 'react';
import { Gift, Copy, Check, X } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; }

export const GiftRegistryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);
  if (!isOpen) return null;

  const accounts = [
    { bank: 'Access Bank', num: '0123456789', name: 'Ezinne Lydia Ezeh / Wedding Fund', type: 'NGN' },
    { bank: 'GTBank', num: '0987654321', name: 'Opeyemi Noah Adeleke', type: 'NGN' },
  ];

  const handleCopy = (n: string) => { navigator.clipboard.writeText(n); setCopied(n); setTimeout(() => setCopied(null), 2000); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-header">
          <div className="modal-header-icon"><Gift size={24} /></div>
          <div className="heading-md">Gift Registry & Cash Envelope</div>
          <p className="small-text" style={{ marginTop: 8, maxWidth: 400, margin: '8px auto 0' }}>
            Your presence is our greatest gift. Should you wish to honor us, a monetary blessing is deeply appreciated!
          </p>
        </div>

        {accounts.map((a) => (
          <div key={a.num} className="account-card">
            <div>
              <div className="label">{a.bank} • {a.type}</div>
              <div className="account-number">{a.num}</div>
              <div className="small-text">{a.name}</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => handleCopy(a.num)}>
              {copied === a.num ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        ))}

        <p className="small-text" style={{ textAlign: 'center', fontStyle: 'italic', marginTop: 16 }}>
          #OPENLILY2026 • May God reward your generosity!
        </p>
      </div>
    </div>
  );
};
