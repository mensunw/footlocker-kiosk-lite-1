import { Suspense } from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import KioskFrame from './KioskFrame';

interface PageProps {
  searchParams: {
    frame?: string;
    variant?: 'V1' | 'V2';
  };
}

async function loadTimeline(variant: 'V1' | 'V2') {
  try {
    const timelineFile = path.join(process.cwd(), 'lib', `timeline_${variant}.json`);
    const timelineData = await fs.readFile(timelineFile, 'utf8');
    return JSON.parse(timelineData);
  } catch (error) {
    console.error('Failed to load timeline:', error);
    return null;
  }
}

export default async function PreviewPage({ searchParams }: PageProps) {
  const frame = parseInt(searchParams.frame || '0', 10);
  const variant = searchParams.variant || 'V1';
  const timeline = await loadTimeline(variant);

  if (!timeline) {
    return (
      <div style={{
        width: '1080px',
        height: '1920px',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '32px'
      }}>
        Timeline not found
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div style={{
        width: '1080px',
        height: '1920px',
        background: '#000'
      }} />
    }>
      <KioskFrame
        frame={frame}
        variant={variant}
        timeline={timeline}
      />
    </Suspense>
  );
}

export async function generateStaticParams() {
  return [];
}