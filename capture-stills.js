const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--window-size=1920,1080', '--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
  const delay = ms => new Promise(r => setTimeout(r, ms));
  
  console.log("Taking screenshot of Login...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-1-login.png' });
  
  console.log("Logging in...");
  const inputs = await page.$$('input');
  if (inputs.length >= 2) {
      await inputs[0].type('admin');
      await inputs[1].type('equinox@123');
  }
  await delay(500);
  
  const btns = await page.$$('button');
  for (const btn of btns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Log In')) {
          await btn.click();
          break;
      }
  }
  await delay(3000); // wait for login to finish and navigate to Admin Portal
  
  console.log("Taking screenshot of General Settings...");
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-7-settings.png' });
  
  console.log("Navigating to User Management...");
  await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('User Management'));
      if (btn) btn.click();
  });
  await delay(1500);
  console.log("Taking screenshot of User Management...");
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-4-employee.png' });

  // Let's also open the Employee Details modal to show it off
  await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      if (rows.length > 1) rows[1].click();
  });
  await delay(1000);
  console.log("Taking screenshot of Employee Modal...");
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-4b-employee-modal.png' });
  
  // Close the modal
  await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      const xIcon = svgs.find(s => s.classList.contains('lucide-x') || s.innerHTML.includes('line'));
      if (xIcon && xIcon.closest('button')) xIcon.closest('button').click();
  });
  await delay(1000);

  console.log("Navigating to Stock Management...");
  await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Stock Management'));
      if (btn) btn.click();
  });
  await delay(1500);
  console.log("Taking screenshot of Stock Management...");
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-3-stock.png' });

  console.log("Navigating to Demand ML...");
  await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Demand ML'));
      if (btn) btn.click();
  });
  await delay(1500);
  console.log("Taking screenshot of Demand ML...");
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-5-demand.png' });
  
  console.log("Navigating to Bills & Returns...");
  await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Bills & Returns'));
      if (btn) btn.click();
  });
  await delay(1500);
  console.log("Taking screenshot of Bills & Returns...");
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-6-sales.png' });

  console.log("Navigating to Checkout via Sidebar...");
  await page.evaluate(() => {
      // Find the sidebar checkout button
      const btns = Array.from(document.querySelectorAll('aside button'));
      const checkoutBtn = btns.find(b => b.textContent.includes('Checkout'));
      if (checkoutBtn) checkoutBtn.click();
  });
  await delay(1500);
  
  console.log("Taking screenshot of Checkout...");
  const addBtns = await page.$$('button[aria-label^="Add"]');
  if (addBtns.length > 0) await addBtns[0].click();
  if (addBtns.length > 1) await addBtns[1].click();
  if (addBtns.length > 2) await addBtns[2].click();
  await delay(1000);
  await page.screenshot({ path: 'brag-output-2026-10-10-171100/shot-2-checkout.png' });
  
  console.log("Done.");
  await browser.close();
})();
