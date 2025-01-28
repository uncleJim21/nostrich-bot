import React, { useState, useEffect } from 'react';
import { Menu, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal.tsx';
interface Feedback {
  type: 'success' | 'error';
  message: string;
}

export default function Home() {
  const [content, setContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [currentNsec, setCurrentNsec] = useState<string | null>(null);

  // useEffect(() => {
  //   // Load saved nsec when component mounts
  //   window.electron.getNsec().then(savedNsec => {
  //     if (savedNsec) setCurrentNsec(savedNsec);
  //   });
  // }, []);

  const handleSaveSettings = async (nsec: string) => {
    try {
      await window.electron.storeNsec(nsec);
      setFeedback({ 
        type: 'success', 
        message: 'NSEC key saved successfully!' 
      });
    } catch (error) {
      console.error('Failed to save NSEC:', error);
      setFeedback({ 
        type: 'error', 
        message: 'Failed to save NSEC key.' 
      });
    }
  };
  

  const isScheduleEnabled =
    content.trim().length > 0 &&
    scheduledTime &&
    new Date(scheduledTime) > new Date();

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:6001/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          scheduledTime: new Date().toISOString(),
          type: 'note',
          tags: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Successfully scheduled!');
      setFeedback({ type: 'success', message: 'Post scheduled successfully!' });
      setContent('');
      setScheduledTime('');
    } catch (error) {
      console.error('Error:', error);
      setFeedback({ type: 'error', message: 'Failed to schedule post.' });
    }
  };

  return (
    <>
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        color: '#fff',
        backgroundColor: '#000',
        position: 'relative',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Icons in the Top Right */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '15px' }}>
        <Menu 
          className="w-8 h-8 cursor-pointer text-white hover:text-gray-300" 
          onClick={() => console.log('Menu clicked')}
        />
        <Settings 
            className="w-8 h-8 cursor-pointer text-white hover:text-gray-300"
            onClick={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Logo */}
      <img
        src={require('../../public/logo.png')}
        alt="NostrichBot"
        style={{
          width: '120px',
          borderRadius: '10%',
          marginBottom: '20px',
        }}
      />
      <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>NostrichBot</h1>
      <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
        Scheduled note posts & AI assistance
      </p>

      {/* Input Section */}
      <textarea
        style={{
          width: '90%',
          maxWidth: '600px', // Limit width for larger screens
          height: '120px',
          margin: '20px 0',
          border: '1px solid #444',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: '#222',
          color: '#fff',
          fontFamily: 'Courier, monospace',
        }}
        placeholder="Start typing your scheduled post here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <div>
        <input
          type="datetime-local"
          style={{
            marginRight: '10px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #444',
            backgroundColor: '#222',
            color: '#fff',
            maxWidth: '200px', // Prevent the input from stretching
          }}
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: isScheduleEnabled ? '#6200ea' : '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isScheduleEnabled ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
          }}
          disabled={!isScheduleEnabled}
          onClick={handleSubmit}
        >
          Schedule
        </button>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: feedback.type === 'success' ? '#4caf50' : '#f44336',
            color: '#fff',
            maxWidth: '400px',
            margin: '20px auto',
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
    {
        isSettingsOpen && (
          <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              onSave={handleSaveSettings}
              initialNsec={currentNsec || ''}  // Add this
          />
        )
      }
    </>
  );
}
