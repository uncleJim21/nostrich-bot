import React, { useState } from 'react';
import logo from '../../public/logo.png';


export default function Home() {
  const [content, setContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [feedback, setFeedback] = useState(null);

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
              type: "note",
              tags: [],
            }),
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          console.log('Successfully scheduled!');
          setContent('');
          setScheduledTime('');
          setFeedback({ type: 'success', message: 'Post scheduled successfully!' });
        } catch (error) {
          console.error('Error:', error);
        }
      };
      

  return (
    <div style={{ textAlign: 'center', padding: '20px', color: '#fff', backgroundColor: '#000' }}>
      <img
        src={logo}
        alt="NostrichBot"
        style={{ width: '100px', borderRadius: '50%', marginBottom: '20px' }}
      />

      <h1>NostrichBot</h1>
      <p>Scheduled note posts & AI enhancements</p>

      <textarea
        style={{
          width: '80%',
          height: '100px',
          margin: '20px 0',
          border: '1px solid #444',
          borderRadius: '5px',
          padding: '10px',
          backgroundColor: '#222',
          color: '#fff',
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
            borderRadius: '5px',
            border: '1px solid #444',
            backgroundColor: '#222',
            color: '#fff',
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
            borderRadius: '5px',
            cursor: isScheduleEnabled ? 'pointer' : 'not-allowed',
          }}
          disabled={!isScheduleEnabled}
          onClick={handleSubmit}
        >
          Schedule
        </button>
      </div>

      {feedback && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: feedback.type === 'success' ? 'green' : 'red',
            color: '#fff',
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
