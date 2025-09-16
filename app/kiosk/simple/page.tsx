'use client';

import { useState, useEffect } from 'react';

export default function SimpleKioskPage() {
  const [timeline, setTimeline] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/timeline/V1')
      .then(res => res.json())
      .then(data => {
        console.log('Timeline loaded:', data);
        setTimeline(data);
      })
      .catch(err => {
        console.error('Error:', err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Simple Kiosk Test</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {!timeline && !error && (
        <div style={{ fontSize: '18px' }}>Loading timeline...</div>
      )}

      {timeline && (
        <div>
          <h2 style={{ color: '#E01A2E' }}>✅ Timeline Loaded Successfully!</h2>
          <div style={{
            width: '540px',
            height: '960px',
            background: '#111',
            border: '2px solid #333',
            borderRadius: '20px',
            margin: '20px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#E01A2E',
            fontWeight: 'bold'
          }}>
            FOOT LOCKER KIOSK
            <br />
            <div style={{ fontSize: '14px', marginTop: '10px' }}>
              {timeline.canvas?.width} × {timeline.canvas?.height}
            </div>
          </div>

          <h3>Scenes:</h3>
          <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {timeline.scenes?.map((scene, i) => (
              <li key={i}>
                <strong>{scene.id}</strong>: {scene.type}
                ({scene.start}s - {scene.start + scene.dur}s)
                {scene.text && ` - "${scene.text}"`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}