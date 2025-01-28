import React from 'react';
import { X, Calendar, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ScheduledPost {
  id: string;
  date: string;
  time: string;
  content: string;
}

interface NoteListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoteListModal = ({ isOpen, onClose }: NoteListModalProps) => {
  // Static data for now
  const scheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      date: 'Jan 25',
      time: '9:47PM',
      content: 'Lorem ipsem lorem ipsem lorem ipsem...'
    },
    {
      id: '2',
      date: 'Jan 25',
      time: '9:47PM',
      content: 'Lorem ipsem lorem ipsem lorem ipsem...'
    }
  ];

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    console.log('Delete post:', id);
    // Will implement actual delete functionality later
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
        maxWidth: '600px',
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

          {/* Header */}
          <h2 style={{
            color: '#fff',
            fontSize: '24px',
            marginBottom: '24px',
            fontFamily: 'monospace'
          }}>
            Upcoming Posts
          </h2>

          {/* Posts list */}
          <div style={{ marginTop: '20px' }}>
            {scheduledPosts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Calendar style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#fff',  // Match the light color from the design
                    }} size={20} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: '#fff',
                    fontFamily: 'monospace',
                    marginBottom: '4px'
                  }}>
                    {post.date} {post.time}
                  </div>
                  <div style={{ 
                    color: '#999',
                    fontFamily: 'monospace'
                  }}>
                    {post.content}
                  </div>
                </div>
                <button
                    onClick={() => handleDelete(post.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#ff0000',  // Match the light color from the design
                    }}
                    >
                    <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteListModal;