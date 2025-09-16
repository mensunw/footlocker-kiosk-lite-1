#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import path from 'path';
import puppeteer from 'puppeteer';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  server: {
    port: 3000,  // Default development port
    host: 'localhost'
  },
  canvas: {
    width: 1080,
    height: 1920,
    fps: 30,
    duration: 30 // seconds
  },
  output: {
    framesDir: './build/frames',
    videosDir: './build/videos',
    quality: 23, // CRF value for ffmpeg (lower = better quality)
    format: 'mp4'
  }
};

class KioskExporter {
  constructor() {
    this.browser = null;
    this.page = null;
    this.serverProcess = null;
  }

  async init() {
    console.log('🚀 Initializing Foot Locker Kiosk Exporter...');

    // Create output directories
    await this.createDirectories();

    // Start Next.js server
    await this.startServer();

    // Launch browser
    await this.launchBrowser();
  }

  async createDirectories() {
    const dirs = [
      CONFIG.output.framesDir,
      CONFIG.output.videosDir,
      `${CONFIG.output.framesDir}/V1`,
      `${CONFIG.output.framesDir}/V2`
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    console.log('📁 Created output directories');
  }

  async startServer() {
    console.log('🔄 Starting Next.js development server...');

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PORT: CONFIG.server.port.toString() }
      });

      let serverReady = false;
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout

      const checkServer = () => {
        attempts++;
        if (attempts > maxAttempts) {
          reject(new Error('Server failed to start within timeout'));
          return;
        }

        exec(`curl -s http://${CONFIG.server.host}:${CONFIG.server.port} > /dev/null`, (error) => {
          if (!error && !serverReady) {
            serverReady = true;
            console.log('✅ Next.js server is ready');
            resolve();
          } else if (!serverReady) {
            setTimeout(checkServer, 1000);
          }
        });
      };

      // Give the server a moment to start
      setTimeout(checkServer, 3000);

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready') || output.includes('compiled')) {
          console.log('📝 Server output:', output.trim());
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('❌ Server error:', data.toString());
      });
    });
  }

  async launchBrowser() {
    console.log('🌐 Launching headless browser...');

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });

    this.page = await this.browser.newPage();

    await this.page.setViewport({
      width: CONFIG.canvas.width,
      height: CONFIG.canvas.height,
      deviceScaleFactor: 1
    });

    // Disable animations and transitions for consistent capture
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });

    console.log('✅ Browser ready');
  }

  async captureFrames(variant) {
    console.log(`🎬 Capturing frames for variant ${variant}...`);

    const totalFrames = CONFIG.canvas.fps * CONFIG.canvas.duration;
    const variantDir = `${CONFIG.output.framesDir}/${variant}`;

    for (let frame = 0; frame < totalFrames; frame++) {
      const url = `http://${CONFIG.server.host}:${CONFIG.server.port}/kiosk/preview?frame=${frame}&variant=${variant}`;

      try {
        await this.page.goto(url, { waitUntil: 'networkidle2' });

        // Wait a bit for any delayed rendering
        await this.page.waitForTimeout(100);

        const screenshotPath = path.join(variantDir, `frame_${String(frame).padStart(5, '0')}.png`);

        await this.page.screenshot({
          path: screenshotPath,
          fullPage: false,
          clip: {
            x: 0,
            y: 0,
            width: CONFIG.canvas.width,
            height: CONFIG.canvas.height
          }
        });

        if (frame % 30 === 0 || frame === totalFrames - 1) {
          console.log(`📸 Captured frame ${frame + 1}/${totalFrames} (${((frame + 1) / totalFrames * 100).toFixed(1)}%)`);
        }
      } catch (error) {
        console.error(`❌ Failed to capture frame ${frame}:`, error.message);
        throw error;
      }
    }

    console.log(`✅ Completed capturing ${totalFrames} frames for ${variant}`);
  }

  async createVideo(variant) {
    console.log(`🎥 Creating video for variant ${variant}...`);

    const inputPattern = `${CONFIG.output.framesDir}/${variant}/frame_%05d.png`;
    const outputPath = `${CONFIG.output.videosDir}/kiosk_lite_${variant}.${CONFIG.output.format}`;

    const ffmpegCommand = [
      'ffmpeg',
      '-y', // Overwrite output file
      '-framerate', CONFIG.canvas.fps.toString(),
      '-i', inputPattern,
      '-c:v', 'libx264',
      '-crf', CONFIG.output.quality.toString(),
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', // Optimize for web streaming
      '-vf', `scale=${CONFIG.canvas.width}:${CONFIG.canvas.height}:flags=lanczos`,
      outputPath
    ].join(' ');

    try {
      console.log('🔄 Running ffmpeg...');
      console.log(`Command: ${ffmpegCommand}`);

      const { stdout, stderr } = await execAsync(ffmpegCommand);

      if (stderr && !stderr.includes('frame=')) {
        console.log('FFmpeg output:', stderr);
      }

      // Verify the output file exists
      await fs.access(outputPath);

      const stats = await fs.stat(outputPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ Video created: ${outputPath} (${sizeInMB} MB)`);

      return outputPath;
    } catch (error) {
      console.error(`❌ Failed to create video for ${variant}:`, error.message);
      throw error;
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');

    if (this.browser) {
      await this.browser.close();
    }

    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');

      // Give it a moment to gracefully shut down
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!this.serverProcess.killed) {
        this.serverProcess.kill('SIGKILL');
      }
    }

    console.log('✅ Cleanup complete');
  }

  async export(variants = ['V1', 'V2']) {
    const startTime = Date.now();

    try {
      await this.init();

      for (const variant of variants) {
        console.log(`\n🎯 Processing variant ${variant}`);
        await this.captureFrames(variant);
        await this.createVideo(variant);
      }

      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

      console.log(`\n🎉 Export complete! Total time: ${duration} minutes`);
      console.log(`📂 Videos saved to: ${CONFIG.output.videosDir}`);

      // List generated files
      const files = await fs.readdir(CONFIG.output.videosDir);
      const videoFiles = files.filter(f => f.endsWith('.mp4'));

      console.log('\n📼 Generated videos:');
      for (const file of videoFiles) {
        const filePath = path.join(CONFIG.output.videosDir, file);
        const stats = await fs.stat(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   • ${file} (${sizeInMB} MB)`);
      }

    } catch (error) {
      console.error('\n❌ Export failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// CLI handling
const args = process.argv.slice(2);
const variants = args.length > 0 ? args : ['V1', 'V2'];

console.log('🎬 Foot Locker Kiosk Video Exporter');
console.log('=====================================');
console.log(`Variants to export: ${variants.join(', ')}`);
console.log(`Canvas: ${CONFIG.canvas.width}×${CONFIG.canvas.height} @ ${CONFIG.canvas.fps}fps`);
console.log(`Duration: ${CONFIG.canvas.duration}s (${CONFIG.canvas.fps * CONFIG.canvas.duration} frames)`);
console.log('=====================================\n');

const exporter = new KioskExporter();

// Handle process interruption
process.on('SIGINT', async () => {
  console.log('\n🛑 Export interrupted by user');
  await exporter.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Export terminated');
  await exporter.cleanup();
  process.exit(0);
});

// Start export
exporter.export(variants);