import React, { useState, useEffect } from 'react';
import { X, Calendar, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { QueuedMessage } from '../server/types/message.ts';

// Create a type for the note as it comes from the server
type SerializedQueuedMessage = Omit<QueuedMessage, 'scheduledTime'> & {
  scheduledTime: string;
};

interface NoteListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoteListModal = ({ isOpen, onClose }: NoteListModalProps) => {
  const [notes, setNotes] = useState<SerializedQueuedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:6001/notes');
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    };
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:6001/notes/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
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

          {/* Content */}
          <div style={{ marginTop: '20px' }}>
            {loading ? (
              <div style={{ 
                color: '#fff', 
                fontFamily: 'Courier, monospace',
                textAlign: 'center',
                padding: '20px'
              }}>
                Loading...
              </div>
            ) : error ? (
              <div style={{ 
                color: '#ff4444', 
                fontFamily: 'Courier, monospace',
                textAlign: 'center',
                padding: '20px'
              }}>
                {error}
              </div>
            ) : notes.length === 0 ? (
              <div style={{ 
                color: '#fff', 
                fontFamily: 'Courier, monospace',
                textAlign: 'center',
                padding: '20px'
              }}>
                No upcoming notes
              </div>
            ) : (
              notes.map((note) => {
                const { date, time } = formatDateTime(note.scheduledTime);
                return (
                  <div
                    key={note.id}
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
                      color: '#fff',
                    }} size={20} />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#fff',
                        fontFamily: 'monospace',
                        marginBottom: '4px'
                      }}>
                        {date} {time}
                      </div>
                      <div style={{ 
                        color: '#999',
                        fontFamily: 'monospace'
                      }}>
                        {note.content}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(note.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#ff0000',
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteListModal;