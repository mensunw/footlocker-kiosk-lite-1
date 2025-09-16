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

interface KioskFrameProps {
  frame: number;
  variant: 'V1' | 'V2';
  timeline: Timeline;
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

export default function KioskFrame({ frame, variant, timeline }: KioskFrameProps) {
  const currentScene = getCurrentScene(frame, timeline.scenes, timeline.canvas.fps);
  const progress = currentScene ? getSceneProgress(frame, currentScene, timeline.canvas.fps) : 0;

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
    fontFamily: '"Bauhaus 93", "Montserrat", Arial, sans-serif'
  };

  if (!currentScene) {
    return (
      <div style={containerStyle}>
        <div style={{ color: 'white', fontSize: '48px', textAlign: 'center' }}>
          Frame {frame} - No Scene
        </div>
      </div>
    );
  }

  const renderScene = () => {
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
        const currentSlate = currentScene.slates?.[slateIndex] || currentScene.slates?.[0];

        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
            padding: '80px'
          }}>
            <Copy
              variant={variant}
              size="headline"
              animation={variant === 'V2' ? 'explode' : 'slideUp'}
              gradient={variant === 'V2'}
            >
              {currentSlate}
            </Copy>
            {variant === 'V2' && (
              <div style={{
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #E01A2E 0%, #ffffff 100%)',
                opacity: 0.6
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
              background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              boxShadow: variant === 'V2'
                ? '0 8px 32px rgba(224, 26, 46, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}>
              Shoe Frame {frameInSequence}
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
            padding: '80px'
          }}>
            <Copy
              variant={variant}
              size="headline"
              animation={currentScene.config?.animation || 'pulse'}
              gradient={variant === 'V2' && currentScene.config?.gradientText}
            >
              {currentScene.text}
            </Copy>

            <LogoStamp
              variant={variant}
              showOptiSigns={false}
              className="absolute bottom-20"
            />
          </div>
        );

      default:
        return (
          <div style={{ color: 'white', fontSize: '32px', textAlign: 'center' }}>
            Unknown scene type: {currentScene.type}
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      {renderScene()}

      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '14px',
        fontFamily: 'monospace',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '8px',
        borderRadius: '4px'
      }}>
        Frame: {frame} | Scene: {currentScene.id} | Progress: {(progress * 100).toFixed(1)}% | Variant: {variant}
      </div>
    </div>
  );
}