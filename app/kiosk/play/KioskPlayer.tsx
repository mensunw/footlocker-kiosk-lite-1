'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import LogoStamp from '@/components/kiosk/LogoStamp';
import Copy from '@/components/kiosk/Copy';
import ImageSequence from '@/components/kiosk/ImageSequence';
import ProductGrid from '@/components/kiosk/ProductGrid';

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

interface KioskPlayerProps {
  timeline: Timeline;
  variant: 'V1' | 'V2';
}

function getCurrentScene(frame: number, scenes: Scene[], fps: number): Scene | null {
  const timeInSeconds = frame / fps;
  return scenes.find(scene =>
    timeInSeconds >= scene.start && timeInSeconds < scene.start + scene.dur
  ) || null;
}

function getSceneProgress(frame: number, scene: Scene, fps: number): number {
  const timeInSeconds = frame / fps;
  const sceneTime = timeInSeconds - scene.start;
  return Math.min(Math.max(sceneTime / scene.dur, 0), 1);
}

export default function KioskPlayer({ timeline, variant }: KioskPlayerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const totalFrames = timeline.canvas.fps * 30; // 30-second loop
  const frameInterval = 1000 / timeline.canvas.fps; // milliseconds per frame

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
    if (isPlaying) {
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
  }, [isPlaying, updateFrame]);

  const currentScene = getCurrentScene(currentFrame, timeline.scenes, timeline.canvas.fps);
  const progress = currentScene ? getSceneProgress(currentFrame, currentScene, timeline.canvas.fps) : 0;

  const containerStyle: React.CSSProperties = {
    width: `${timeline.canvas.width}px`,
    height: `${timeline.canvas.height}px`,
    background: timeline.canvas.bg,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Bauhaus 93", "Montserrat", Arial, sans-serif',
    borderRadius: '12px',
    boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)'
  };

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
          Loading...
        </div>
      );
    }

    switch (currentScene.type) {
      case 'brand':
        return (
          <LogoStamp
            variant={variant}
            showOptiSigns={true}
          />
        );

      case 'copy':
        return (
          <Copy
            variant={variant}
            size="headline"
            animation={currentScene.config?.animation || 'slideUp'}
            gradient={variant === 'V2' && currentScene.config?.gradient}
          >
            {currentScene.text}
          </Copy>
        );

      case 'montage':
        const slateIndex = Math.floor(progress * (currentScene.slates?.length || 1));
        const currentSlate = currentScene.slates?.[Math.min(slateIndex, (currentScene.slates?.length || 1) - 1)];

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
            padding: '80px',
            position: 'relative'
          }}>
            <Copy
              variant={variant}
              size="headline"
              animation={variant === 'V2' ? 'explode' : 'slideUp'}
              gradient={variant === 'V2'}
              key={currentSlate}
            >
              {currentSlate}
            </Copy>
            {variant === 'V2' && (
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
        const frameInSequence = Math.floor(progress * (currentScene.frames || 36)) + 1;

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
            padding: '60px'
          }}>
            <Copy
              variant={variant}
              size="subheadline"
              animation="fade"
            >
              {currentScene.headline}
            </Copy>

            <div style={{
              width: '400px',
              height: '400px',
              borderRadius: '20px',
              background: variant === 'V2'
                ? 'linear-gradient(135deg, #2a0000 0%, #000000 100%)'
                : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              boxShadow: variant === 'V2'
                ? '0 8px 32px rgba(224, 26, 46, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                border: '3px solid #E01A2E',
                borderRadius: '50%',
                borderTopColor: 'transparent',
                animation: 'spin 2s linear infinite',
                opacity: 0.8
              }} />
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div>360° View</div>
                <div style={{ fontSize: '16px', opacity: 0.6, marginTop: '4px' }}>
                  Frame {frameInSequence}
                </div>
              </div>
            </div>

            <Copy
              variant={variant}
              size="caption"
              animation="fade"
            >
              {currentScene.sub}
            </Copy>
          </div>
        );

      case 'grid':
        return (
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <ProductGrid
              dataPath={currentScene.data || '/data/new_arrivals_jordan.json'}
              variant={variant}
              columns={currentScene.config?.columns || 2}
              rows={currentScene.config?.rows || 3}
              animationType={currentScene.config?.animationType || 'stagger'}
              titleText={currentScene.config?.titleText}
            />
          </div>
        );

      case 'cta':
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '80px',
            position: 'relative'
          }}>
            <Copy
              variant={variant}
              size="headline"
              animation={currentScene.config?.animation || 'pulse'}
              gradient={variant === 'V2' && currentScene.config?.gradientText}
            >
              {currentScene.text}
            </Copy>

            <div style={{
              position: 'absolute',
              bottom: '80px'
            }}>
              <LogoStamp
                variant={variant}
                showOptiSigns={false}
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

  const timeInSeconds = currentFrame / timeline.canvas.fps;
  const totalSeconds = totalFrames / timeline.canvas.fps;

  return (
    <div style={{ position: 'relative' }}>
      <div style={containerStyle}>
        {renderScene()}
      </div>

      {/* Player Controls */}
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        left: '50%',
        transform: 'translateX(-50%)',
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
              width: `${(timeInSeconds / totalSeconds) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #E01A2E 0%, #ffffff 100%)',
              transition: 'width 0.1s ease'
            }} />
          </div>
          <span>{totalSeconds}s</span>
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}