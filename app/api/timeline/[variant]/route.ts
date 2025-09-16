import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { variant: string } }
) {
  try {
    const { variant } = params;

    if (!['V1', 'V2'].includes(variant)) {
      return NextResponse.json(
        { error: 'Invalid variant. Must be V1 or V2' },
        { status: 400 }
      );
    }

    const timelineFile = path.join(process.cwd(), 'lib', `timeline_${variant}.json`);
    const timelineData = await fs.readFile(timelineFile, 'utf8');
    const timeline = JSON.parse(timelineData);

    return NextResponse.json(timeline, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to load timeline:', error);
    return NextResponse.json(
      { error: 'Failed to load timeline' },
      { status: 500 }
    );
  }
}