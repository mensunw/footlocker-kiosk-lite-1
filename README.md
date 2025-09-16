# Foot Locker Kiosk Experience - Developer Handoff

## Project Overview

A complete 30-second portrait kiosk video experience for Foot Locker built with Next.js 14 App Router. The application features real-time playback, frame-by-frame preview capabilities, and video export functionality with two stylistic variations (V1 minimal, V2 dynamic).

**Key Specifications:**
- **Resolution**: 1080×1920 portrait (scaled to 540×960 for display)
- **Frame Rate**: 30fps
- **Duration**: 30-second seamless loop
- **Technology**: Next.js 14+ App Router, React 18, TypeScript

## 🎯 Completed Features

### Core Functionality
- ✅ **Real-time kiosk playback** with 30fps animation loop
- ✅ **Two stylistic variants** (V1 minimal, V2 dynamic with red accents)
- ✅ **Interactive 360° sneaker viewer** using Foot Locker's SpinViewer
- ✅ **Six distinct scenes** with smooth transitions
- ✅ **Frame-by-frame preview system** for video export
- ✅ **API-driven timeline configuration**
- ✅ **Professional brand integration** with real logos

### Interactive Elements
- ✅ **Variant switching** (V1/V2) with real-time updates
- ✅ **Playback controls** (play/pause, restart, progress bar)
- ✅ **360° product interaction** (click & drag to rotate, scroll to zoom)
- ✅ **Debug information display** (frame count, scene tracking, timing)

## 📁 Project Structure

```
project/
├── app/
│   ├── api/timeline/[variant]/route.ts     # Timeline data API endpoints
│   └── kiosk/
│       ├── play/page.tsx                   # Main kiosk player (WORKING)
│       ├── preview/page.tsx                # Frame preview for export
│       ├── preview/KioskFrame.tsx          # Server-side frame renderer
│       ├── working/page.tsx                # Alternative working version
│       └── simple/page.tsx                 # Simplified test version
├── components/kiosk/                       # Reusable kiosk components
│   ├── LogoStamp.tsx/.module.css          # Brand logo display
│   ├── Copy.tsx/.module.css               # Animated text component
│   ├── ImageSequence.tsx/.module.css      # 360° rotation component
│   └── ProductGrid.tsx/.module.css        # Jordan sneaker grid
├── lib/
│   ├── timeline_V1.json                   # V1 minimal variant config
│   ├── timeline_V2.json                   # V2 dynamic variant config
│   └── styles.tokens.json                 # Design system tokens
├── public/
│   ├── assets/
│   │   ├── footlocker/Footlocker logo.svg # Real Foot Locker logo
│   │   ├── optisigns/optisigns-logo.svg   # Real OptiSigns logo
│   │   └── shoes/                         # Placeholder product images
│   ├── data/new_arrivals_jordan.json      # Product data
│   └── lib/                               # Public timeline copies
├── scripts/build.kiosk-lite.mjs           # Puppeteer+FFmpeg export script
└── build/                                 # Generated video output directory
```

## 🎬 Scene Breakdown (30-second Timeline)

| Scene | Time | Type | Description |
|-------|------|------|-------------|
| **S1** | 0-2s | Brand | Foot Locker + OptiSigns logo display |
| **S2** | 2-5s | Copy | "Step Into the Culture" headline |
| **S3** | 5-10s | Montage | Rotating slogans with transitions |
| **S4** | 10-16s | Spin | Interactive 360° sneaker viewer |
| **S5** | 16-23s | Grid | Jordan New Arrivals product showcase |
| **S6** | 23-30s | CTA | Final call-to-action with logo |

## 🔧 Technical Implementation

### API Routes
- **`/api/timeline/V1`** - Returns V1 timeline configuration
- **`/api/timeline/V2`** - Returns V2 timeline configuration

### Key Pages
- **`/kiosk/play`** - **PRIMARY WORKING VERSION** - Full kiosk experience
- **`/kiosk/preview?frame=N&variant=V1`** - Single frame preview for export
- **`/kiosk/working`** - Alternative implementation (also working)
- **`/kiosk/simple`** - Simplified test version

### Timeline Configuration System
Each variant uses JSON configuration files defining:
- Canvas properties (dimensions, fps, background)
- Scene definitions (timing, type, content, styling)
- Animation parameters and variant-specific effects

### Animation System
- **requestAnimationFrame** loop for smooth 30fps playback
- **Frame-based timing** with scene transitions
- **Variant-specific styling** and effects
- **Seamless looping** back to frame 0

## 🎨 Brand Compliance

### Visual Identity
- **Colors**: Black (#000000), White (#FFFFFF), Red (#E01A2E)
- **Typography**: Arial/sans-serif, 900 weight, uppercase styling
- **Text Size**: ≥36px for kiosk readability
- **Accessibility**: <3Hz animation frequency, high contrast

### Logo Integration
- **Foot Locker**: `/public/assets/footlocker/Footlocker logo.svg`
- **OptiSigns**: `/public/assets/optisigns/optisigns-logo.svg`
- **Positioning**: Prominent Foot Locker placement, subtle OptiSigns credit
- **Effects**: Variant-specific drop shadows and glow effects

### Interactive 360° Viewer
- **URL**: `https://assets.footlocker.com/s7viewers/html5/SpinViewer.html`
- **Asset**: `FLDM/314217794404_02` (Air Jordan sneaker)
- **Functionality**: Click & drag rotation, scroll zoom
- **Integration**: Embedded iframe with user instructions overlay

## 🚀 Running the Application

### Development
```bash
npm run dev
# Visit: /kiosk/play
```

### Key URLs
- **Main Experience**: `/kiosk/play`
- **Frame Preview**: `/kiosk/preview?frame=150&variant=V1`
- **API Test**: `/api/timeline/V1`

### Video Export (Optional)
```bash
node scripts/build.kiosk-lite.mjs
# Generates: build/videos/kiosk_lite_V1.mp4 & kiosk_lite_V2.mp4
```

**Export Dependencies:**
- Node.js puppeteer package
- FFmpeg installed system-wide
- Sufficient disk space for frame capture

## 📋 Data Files

### Product Data (`/public/data/new_arrivals_jordan.json`)
```json
[
  {
    "image": "/assets/shoes/jordan-1.png",
    "name": "Air Jordan 1 Retro High",
    "price": "$170"
  }
  // ... 6 total products
]
```

### Timeline Configuration (`/lib/timeline_V1.json`)
```json
{
  "canvas": {
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "bg": "#000000"
  },
  "scenes": [
    {
      "id": "S1",
      "start": 0,
      "dur": 2,
      "type": "brand",
      "config": { /* variant-specific settings */ }
    }
    // ... 6 total scenes
  ]
}
```

## 🐛 Known Issues & Notes

### Working Status
- ✅ **`/kiosk/play`** - Fully functional, main implementation
- ✅ **`/kiosk/working`** - Alternative working version
- ⚠️ **Component imports** - Some individual kiosk components may have CSS module loading issues
- ⚠️ **Export script** - Requires puppeteer and ffmpeg setup

### Performance Considerations
- **Animation loop** uses requestAnimationFrame for optimal performance
- **Large timeline files** are cached by API routes
- **360° viewer** loads externally from Foot Locker CDN

### Browser Compatibility
- **Modern browsers** with ES6+ support required
- **iframe support** needed for 360° viewer
- **CSS grid/flexbox** support required

## 🔄 Future Enhancements

### Potential Improvements
1. **Audio integration** - Background music or sound effects
2. **Touch gestures** - Swipe controls for kiosk hardware
3. **CMS integration** - Dynamic content management
4. **Analytics tracking** - User interaction monitoring
5. **Multiple product rotations** - Additional 360° viewers
6. **Responsive scaling** - Auto-adjust to different screen sizes

### Code Architecture
- **Component library** - Extract reusable kiosk components
- **State management** - Consider Redux/Zustand for complex state
- **Testing suite** - Unit tests for scene rendering
- **Error boundaries** - Better error handling and fallbacks

## 📞 Handoff Checklist

### ✅ Completed
- [x] Fully functional kiosk experience at `/kiosk/play`
- [x] Two working style variants (V1/V2)
- [x] Interactive 360° sneaker viewer integration
- [x] Real brand logos (Foot Locker + OptiSigns)
- [x] Complete timeline system with JSON configuration
- [x] Frame-by-frame preview system for export
- [x] API routes for timeline data serving
- [x] Export script for video generation
- [x] Comprehensive documentation

### 🔍 Testing Recommendations
1. **Verify main experience**: Visit `/kiosk/play` and test both variants
2. **Check 360° interaction**: Ensure sneaker viewer loads and responds
3. **Test timeline progression**: Confirm all 6 scenes display properly
4. **Validate API endpoints**: Test `/api/timeline/V1` and `/api/timeline/V2`
5. **Export functionality**: Run export script if video generation needed

### 📋 Deployment Notes
- Ensure all static assets in `/public/assets/` are deployed
- Verify API routes are properly configured
- Test external iframe loading (360° viewer)
- Confirm timeline JSON files are accessible
- Check CORS settings if deploying to different domain

---

**Project Status**: ✅ **COMPLETE & FUNCTIONAL**
**Primary URL**: `/kiosk/play`
**Last Updated**: September 2025
**Ready for**: Production deployment, further customization, or video export