const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  const recordFeature = async (name, actions) => {
    const Config = { followNewTab: false, fps: 30, videoFrame: { width: 1920, height: 1080 }, aspectRatio: '16:9' };
    const recorder = new PuppeteerScreenRecorder(page, Config);
    await recorder.start(`brag-output-2026-10-10-171100/${name}.mp4`);
    await actions();
    await recorder.stop();
  };

  console.log("Navigating to app...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await delay(1000);
  
  // Feature 1: Login
  console.log("Recording Login...");
  await recordFeature('feature-login', async () => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Login as Admin'));
      if (btn) btn.click();
    });
    await delay(2000);
  });
  
  // Feature 2: Stock Management
  console.log("Recording Stock...");
  await recordFeature('feature-stock', async () => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a, div'));
      const btn = btns.find(b => b.textContent.includes('Stock Management'));
      if (btn) btn.click();
    });
    await delay(3000);
  });
  
  // Feature 3: Demand ML
  console.log("Recording Demand ML...");
  await recordFeature('feature-demand', async () => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a, div'));
      const btn = btns.find(b => b.textContent.includes('Demand ML'));
      if (btn) btn.click();
    });
    await delay(3000);
  });
  
  // Feature 4: Admin Portal / Employee
  console.log("Recording Admin/Employee...");
  await recordFeature('feature-admin', async () => {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a, div'));
      const btn = btns.find(b => b.textContent.includes('Admin Portal'));
      if (btn) btn.click();
    });
    await delay(1000);
    // Click Employee Management
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a, div'));
      const btn = btns.find(b => b.textContent.includes('Employee Management'));
      if (btn) btn.click();
    });
    await delay(3000);
  });

  console.log("Done.");
  await browser.close();
})();
