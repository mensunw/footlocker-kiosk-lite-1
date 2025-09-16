'use client';

import { useState, useEffect } from 'react';

export default function WorkingKioskPage() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load timeline data
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const response = await fetch('/api/timeline/V1');
        if (!response.ok) throw new Error('Failed to load timeline');
        const data = await response.json();
        setTimeline(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadTimeline();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !timeline) return;

    const fps = timeline.canvas?.fps || 30;
    const totalFrames = fps * 30; // 30 seconds

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % totalFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isPlaying, timeline]);

  const getCurrentScene = () => {
    if (!timeline) return null;

    const timeInSeconds = currentFrame / (timeline.canvas?.fps || 30);
    return timeline.scenes?.find(scene =>
      timeInSeconds >= scene.start && timeInSeconds < scene.start + scene.dur
    ) || null;
  };

  const currentScene = getCurrentScene();
  const timeInSeconds = timeline ? currentFrame / timeline.canvas.fps : 0;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading Foot Locker Kiosk...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#E01A2E',
        fontSize: '24px'
      }}>
        Error: {error}
      </div>
    );
  }

  const renderScene = () => {
    if (!currentScene) {
      return (
        <div style={{ color: 'white', fontSize: '48px', textAlign: 'center' }}>
          No Scene
        </div>
      );
    }

    switch (currentScene.type) {
      case 'brand':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              marginBottom: '40px',
              textTransform: 'uppercase'
            }}>
              FOOT LOCKER
            </div>
            <div style={{
              position: 'absolute',
              bottom: '60px',
              right: '60px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              OptiSigns
            </div>
          </div>
        );

      case 'copy':
        return (
          <div style={{
            fontSize: '72px',
            fontWeight: '900',
            color: 'white',
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: '0.9'
          }}>
            {currentScene.text}
          </div>
        );

      case 'montage':
        const progress = (timeInSeconds - currentScene.start) / currentScene.dur;
        const slateIndex = Math.floor(progress * (currentScene.slates?.length || 1));
        const currentSlate = currentScene.slates?.[Math.min(slateIndex, (currentScene.slates?.length || 1) - 1)];

        return (
          <div style={{
            fontSize: '72px',
            fontWeight: '900',
            color: 'white',
            textAlign: 'center',
            textTransform: 'uppercase',
            lineHeight: '0.9'
          }}>
            {currentSlate}
          </div>
        );

      case 'spin':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '56px',
              fontWeight: '900',
              color: 'white',
              marginBottom: '60px',
              textTransform: 'uppercase'
            }}>
              {currentScene.headline}
            </div>

            <div style={{
              width: '400px',
              height: '400px',
              margin: '0 auto 60px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              border: '2px solid #333'
            }}>
              360° Sneaker View
            </div>

            <div style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center'
            }}>
              {currentScene.sub}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              marginBottom: '60px',
              textTransform: 'uppercase'
            }}>
              Fresh Jordan Arrivals
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '30px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {['Air Jordan 1', 'Air Jordan 4', 'Air Jordan 11', 'Air Jordan 12', 'Air Jordan 3', 'Air Jordan 5'].map((name, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    height: '120px',
                    background: '#f0f0f0',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333'
                  }}>
                    Sneaker {i + 1}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '5px'
                  }}>
                    {name}
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#E01A2E'
                  }}>
                    ${170 + i * 10}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              textTransform: 'uppercase',
              lineHeight: '0.9',
              marginBottom: '100px'
            }}>
              {currentScene.text}
            </div>

            <div style={{
              fontSize: '32px',
              fontWeight: '900',
              color: 'white',
              textTransform: 'uppercase'
            }}>
              FOOT LOCKER
            </div>
          </div>
        );

      default:
        return (
          <div style={{ color: 'white', fontSize: '32px', textAlign: 'center' }}>
            Unknown scene: {currentScene.type}
          </div>
        );
    }
  };

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Kiosk Display */}
      <div style={{
        width: '540px',
        height: '960px',
        background: timeline?.canvas?.bg || '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Arial", sans-serif',
        borderRadius: '12px',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)',
        border: '2px solid #333'
      }}>
        {renderScene()}

        {/* Debug Info */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
          fontFamily: 'monospace',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '8px',
          borderRadius: '4px'
        }}>
          Frame: {currentFrame} | Scene: {currentScene?.id || 'none'} | Time: {timeInSeconds.toFixed(1)}s
        </div>
      </div>

      {/* Controls */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={() => setCurrentFrame(0)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ⏮
        </button>

        <span style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          {timeInSeconds.toFixed(1)}s / 30.0s
        </span>

        {currentScene && (
          <span style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {currentScene.id}
          </span>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Foot Locker Kiosk Experience</strong>
        </p>
        <p style={{ margin: '0' }}>
          30-second loop • Portrait 1080×1920 • 30fps (scaled down)
        </p>
      </div>
    </div>
  );
}