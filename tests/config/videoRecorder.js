import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const execFileAsync = promisify(execFile);

class ScenarioVideoRecorder {
  constructor() {
    this.cdpSession = null;
    this.framesDir = null;
    this.frameCount = 0;
    this.onFrame = null;
    this.recording = false;
  }

  async start() {
    this.stopCleanup();
    this.framesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'emuna-wdio-video-'));
    this.frameCount = 0;
    this.recording = true;

    try {
      const puppeteer = await browser.getPuppeteer();
      const pages = await puppeteer.pages();
      const page = pages[0];
      if (!page) return;

      this.cdpSession = await page.createCDPSession();

      this.onFrame = async ({ data, sessionId }) => {
        if (!this.recording || !this.framesDir) return;
        this.frameCount += 1;
        const frameName = `frame-${String(this.frameCount).padStart(5, '0')}.jpg`;
        const framePath = path.join(this.framesDir, frameName);
        fs.writeFileSync(framePath, Buffer.from(data, 'base64'));
        try {
          await this.cdpSession?.send('Page.screencastFrameAck', { sessionId });
        } catch {
          // Ignore ack errors if session closed
        }
      };

      this.cdpSession.on('Page.screencastFrame', this.onFrame);
      await this.cdpSession.send('Page.startScreencast', {
        format: 'jpeg',
        quality: 75,
        everyNthFrame: 1,
      });
    } catch (err) {
      console.error('[videoRecorder] start error:', err?.message || err);
      this.recording = false;
    }
  }

  async stopAndEncode() {
    this.recording = false;

    try {
      if (this.cdpSession) {
        if (this.onFrame) {
          this.cdpSession.off('Page.screencastFrame', this.onFrame);
        }
        await this.cdpSession.send('Page.stopScreencast').catch(() => {});
        await this.cdpSession.detach().catch(() => {});
      }
    } finally {
      this.cdpSession = null;
      this.onFrame = null;
    }

    if (!this.framesDir || this.frameCount === 0) {
      this.stopCleanup();
      return null;
    }

    // Ensure at least 2 frames so ffmpeg produces a valid video stream
    if (this.frameCount === 1) {
      fs.copyFileSync(
        path.join(this.framesDir, 'frame-00001.jpg'),
        path.join(this.framesDir, 'frame-00002.jpg')
      );
    }

    const outputPath = path.join(this.framesDir, 'scenario.webm');

    try {
      await execFileAsync(ffmpegInstaller.path, [
        '-y',
        '-framerate',
        '6',
        '-i',
        path.join(this.framesDir, 'frame-%05d.jpg'),
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v',
        'libvpx',
        '-crf',
        '30',
        '-b:v',
        '1M',
        '-pix_fmt',
        'yuv420p',
        outputPath,
      ]);

      const videoBase64 = fs.readFileSync(outputPath).toString('base64');
      return videoBase64;
    } catch (err) {
      console.error('[videoRecorder] ffmpeg error:', err?.message || err);
      return null;
    } finally {
      this.stopCleanup();
    }
  }

  stopCleanup() {
    if (this.framesDir) {
      fs.rmSync(this.framesDir, { recursive: true, force: true });
      this.framesDir = null;
    }
    this.frameCount = 0;
  }
}

export default new ScenarioVideoRecorder();
