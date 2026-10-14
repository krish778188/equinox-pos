const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const Config = {
    followNewTab: false,
    fps: 60, // Smooth 60fps for animations!
    videoFrame: { width: 1920, height: 1080 },
    aspectRatio: '16:9'
  };
  const recorder = new PuppeteerScreenRecorder(page, Config);
  await recorder.start('brag-output-2026-10-10-171100/launch-video.mp4');
  
  console.log("Loading cinematic HTML...");
  await page.goto('http://localhost:8080/brag-output-2026-10-10-171100/cinematic.html', { waitUntil: 'networkidle0' });
  
  console.log("Starting sequence...");
  await page.evaluate(() => window.startSequence());
  
  // Wait until window.sequenceFinished is true
  while (true) {
      const finished = await page.evaluate(() => window.sequenceFinished);
      if (finished) break;
      await new Promise(r => setTimeout(r, 500));
  }
  
  // Extra second for final frame
  await new Promise(r => setTimeout(r, 1000));
  
  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Rendered brag-output-2026-10-10-171100/launch-video.mp4");
})();
