'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Scene {
  id: string;
  start: number;
  dur: number;
  type: string;
  text?: string;
  slates?: string[];
  headline?: string;
  sub?: string;
  sequencePattern?: string;
  frames?: number;
  data?: string;
  config?: any;
}

interface Timeline {
  canvas: {
    width: number;
    height: number;
    fps: number;
    bg: string;
  };
  scenes: Scene[];
}

export default function PlayPage() {
  const [timelineV1, setTimelineV1] = useState<Timeline | null>(null);
  const [timelineV2, setTimelineV2] = useState<Timeline | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<'V1' | 'V2'>('V1');
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadTimelines = async () => {
      try {
        const [v1Response, v2Response] = await Promise.all([
          fetch('/api/timeline/V1'),
          fetch('/api/timeline/V2')
        ]);

        const [v1Data, v2Data] = await Promise.all([
          v1Response.json(),
          v2Response.json()
        ]);

        setTimelineV1(v1Data);
        setTimelineV2(v2Data);
      } catch (error) {
        console.error('Failed to load timelines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimelines();
  }, []);

  const currentTimeline = selectedVariant === 'V1' ? timelineV1 : timelineV2;
  const totalFrames = currentTimeline ? currentTimeline.canvas.fps * 30 : 900; // 30-second loop
  const frameInterval = currentTimeline ? 1000 / currentTimeline.canvas.fps : 33; // milliseconds per frame

  const updateFrame = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;

    if (deltaTime >= frameInterval) {
      setCurrentFrame(prev => (prev + 1) % totalFrames);
      lastTimeRef.current = timestamp;
    }

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    }
  }, [isPlaying, frameInterval, totalFrames]);

  useEffect(() => {
    if (isPlaying && currentTimeline) {
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updateFrame, currentTimeline]);

  const getCurrentScene = () => {
    if (!currentTimeline) return null;

    const timeInSeconds = currentFrame / currentTimeline.canvas.fps;
    return currentTimeline.scenes?.find(scene =>
      timeInSeconds >= scene.start && timeInSeconds < scene.start + scene.dur
    ) || null;
  };

  const currentScene = getCurrentScene();
  const timeInSeconds = currentTimeline ? currentFrame / currentTimeline.canvas.fps : 0;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentFrame(0);
    lastTimeRef.current = 0;
    setIsPlaying(true);
  };

  const renderScene = () => {
    if (!currentScene) {
      return (
        <div style={{ color: 'white', fontSize: '48px', textAlign: 'center' }}>
          Loading Scene...
        </div>
      );
    }

    switch (currentScene.type) {
      case 'brand':
        return (
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/assets/footlocker/Footlocker logo.svg"
                alt="Foot Locker"
                style={{
                  height: '80px',
                  width: 'auto',
                  filter: selectedVariant === 'V2'
                    ? 'drop-shadow(0 0 20px rgba(224, 26, 46, 0.4))'
                    : 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))'
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '60px',
              right: '60px',
              opacity: 0.8
            }}>
              <img
                src="/assets/optisigns/optisigns-logo.svg"
                alt="OptiSigns"
                style={{
                  height: '25px',
                  width: 'auto',
                  opacity: 0.9
                }}
              />
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
            lineHeight: '0.9',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px'
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
            lineHeight: '0.9',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px'
          }}>
            {currentSlate}
            {selectedVariant === 'V2' && (
              <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '80px',
                right: '80px',
                height: '4px',
                background: 'linear-gradient(90deg, #E01A2E 0%, #ffffff 100%)',
                opacity: 0.6,
                borderRadius: '2px'
              }} />
            )}
          </div>
        );

      case 'spin':
        return (
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '60px'
          }}>
            <div style={{
              fontSize: '56px',
              fontWeight: '900',
              color: 'white',
              marginBottom: '40px',
              textTransform: 'uppercase',
              fontFamily: 'Arial, sans-serif'
            }}>
              {currentScene.headline}
            </div>

            <div style={{
              width: '450px',
              height: '450px',
              borderRadius: '20px',
              background: selectedVariant === 'V2'
                ? 'linear-gradient(135deg, #2a0000 0%, #000000 100%)'
                : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              boxShadow: selectedVariant === 'V2'
                ? '0 8px 32px rgba(224, 26, 46, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '40px',
              border: '2px solid rgba(224, 26, 46, 0.3)'
            }}>
              <iframe
                src="https://assets.footlocker.com/s7viewers/html5/SpinViewer.html?asset=FLDM/314217794404_02&config=FLDM/SpinSet_light&serverUrl=https://assets.footlocker.com/is/image/&contenturl=https://assets.footlocker.com/is/content/"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '18px'
                }}
                title="360° Sneaker Viewer"
                allow="accelerometer; gyroscope"
                loading="lazy"
              />

              {/* Overlay with tap instruction */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
                pointerEvents: 'none'
              }}>
                👆 Click & Drag to Rotate • Scroll to Zoom
              </div>
            </div>

            <div style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.3',
              maxWidth: '400px'
            }}>
              {currentScene.sub}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '40px'
          }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              marginBottom: '60px',
              textTransform: 'uppercase',
              fontFamily: 'Arial, sans-serif'
            }}>
              Fresh Jordan Arrivals
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: '30px',
              maxWidth: '800px',
              width: '100%'
            }}>
              {['Air Jordan 1', 'Air Jordan 4', 'Air Jordan 11', 'Air Jordan 12', 'Air Jordan 3', 'Air Jordan 5'].map((name, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: selectedVariant === 'V2'
                    ? '2px solid rgba(224, 26, 46, 0.2)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
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
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    Sneaker {i + 1}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'white',
                    marginBottom: '5px',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    {name}
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '900',
                    color: '#E01A2E',
                    fontFamily: 'Arial, sans-serif'
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
          <div style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '80px',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '64px',
              fontWeight: '900',
              color: 'white',
              textTransform: 'uppercase',
              lineHeight: '0.9',
              marginBottom: '120px',
              fontFamily: 'Arial, sans-serif'
            }}>
              {currentScene.text}
            </div>

            <div style={{
              position: 'absolute',
              bottom: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/assets/footlocker/Footlocker logo.svg"
                alt="Foot Locker"
                style={{
                  height: '50px',
                  width: 'auto',
                  filter: selectedVariant === 'V2'
                    ? 'drop-shadow(0 0 15px rgba(224, 26, 46, 0.3))'
                    : 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))'
                }}
              />
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

  if (isLoading) {
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

  if (!currentTimeline) {
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
        Timeline not available
      </div>
    );
  }

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
      {/* Variant Selector */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setSelectedVariant('V1')}
          style={{
            padding: '8px 16px',
            background: selectedVariant === 'V1' ? '#E01A2E' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          V1 - Minimal
        </button>
        <button
          onClick={() => setSelectedVariant('V2')}
          style={{
            padding: '8px 16px',
            background: selectedVariant === 'V2' ? '#E01A2E' : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          V2 - Dynamic
        </button>
      </div>

      {/* Kiosk Display */}
      <div style={{
        width: '540px',
        height: '960px',
        background: currentTimeline.canvas.bg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '12px',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)'
      }}>
        {renderScene()}

      </div>

      {/* Player Controls */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '12px 20px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        backdropFilter: 'blur(8px)'
      }}>
        <button
          onClick={handlePlayPause}
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
          onClick={handleRestart}
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

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          <span>{timeInSeconds.toFixed(1)}s</span>
          <div style={{
            width: '200px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(timeInSeconds / 30) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #E01A2E 0%, #ffffff 100%)',
              transition: 'width 0.1s ease'
            }} />
          </div>
          <span>30.0s</span>
        </div>

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
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Foot Locker Kiosk Experience</strong>
        </p>
        <p style={{ margin: '0 0 4px 0' }}>
          30-second loop • Portrait 1080×1920 • 30fps
        </p>
        <p style={{ margin: '0' }}>
          Switch between V1 (minimal) and V2 (dynamic) variants
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}