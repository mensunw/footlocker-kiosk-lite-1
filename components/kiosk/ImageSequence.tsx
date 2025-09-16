'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ImageSequence.module.css';

interface ImageSequenceProps {
  sequencePattern: string;
  totalFrames: number;
  frameRate?: number;
  autoPlay?: boolean;
  loop?: boolean;
  variant?: 'V1' | 'V2';
  className?: string;
  onFrameChange?: (frame: number) => void;
}

export default function ImageSequence({
  sequencePattern,
  totalFrames,
  frameRate = 12,
  autoPlay = true,
  loop = true,
  variant = 'V1',
  className = '',
  onFrameChange
}: ImageSequenceProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev >= totalFrames ? (loop ? 1 : totalFrames) : prev + 1;
        onFrameChange?.(nextFrame);
        return nextFrame;
      });
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [isPlaying, frameRate, totalFrames, loop, onFrameChange]);

  const getImageSrc = (frame: number) => {
    return sequencePattern.replace('#', frame.toString());
  };

  return (
    <div className={`${styles.imageSequence} ${styles[`variant${variant}`]} ${className}`}>
      <div className={styles.frameContainer}>
        <Image
          src={getImageSrc(currentFrame)}
          alt={`Frame ${currentFrame}`}
          width={400}
          height={400}
          priority
          className={styles.frame}
        />
      </div>

      <div className={styles.controls}>
        <button
          className={styles.playButton}
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${(currentFrame / totalFrames) * 100}%` }}
          />
        </div>

        <span className={styles.frameCounter}>
          {currentFrame} / {totalFrames}
        </span>
      </div>
    </div>
  );
}