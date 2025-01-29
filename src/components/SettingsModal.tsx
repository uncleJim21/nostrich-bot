import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nsec: string) => void;
  initialNsec?: string;
}

const SettingsModal = ({ isOpen, onClose, onSave, initialNsec = '' }: SettingsModalProps) => {
  const [nsec, setNsec] = useState(initialNsec);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(nsec);
    onClose();
  };

  return createPortal(
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999
      }}>
        <div style={{ 
          width: '90%',
          maxWidth: '500px',
          position: 'relative',
        }}>
        {/* Stacked card effect */}
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          right: '-4px',
          bottom: '-4px',
          border: '1px solid #333',
          borderRadius: '12px',
          zIndex: 1
        }} />
        
        {/* Main card */}
        <div style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '24px',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Close button */}
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X style={{ width: '24px', height: '24px' }} />
          </button>

          {/* Content */}
          <h2 style={{
            color: '#fff',
            fontSize: '24px',
            marginBottom: '24px',
            fontFamily: 'monospace'
          }}>
            Settings
          </h2>

          <div>
            <label style={{
              display: 'block',
              color: '#fff',
              marginBottom: '8px',
              fontFamily: 'monospace'
            }}>
              nsec
            </label>
            <input
              type="text"
              value={nsec}
              onChange={(e) => setNsec(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'monospace',
                marginBottom: '24px'
              }}
              placeholder="Enter your nsec..."
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#b800e9',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 24px',
                fontFamily: 'monospace',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;