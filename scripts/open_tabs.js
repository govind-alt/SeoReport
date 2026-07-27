const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      args: ['--start-maximized']
    });

    // 1. Agency
    const context1 = await browser.createBrowserContext();
    const page1 = await context1.newPage();
    await page1.goto('http://localhost:3000/login');
    await page1.type('#loginEmail', 'admin@agency.com');
    await page1.type('#loginPassword', 'password123');
    await page1.click('#loginBtn');
    
    // 2. Client
    const context2 = await browser.createBrowserContext();
    const page2 = await context2.newPage();
    await page2.goto('http://localhost:3000/login');
    await page2.type('#loginEmail', 'client@zomato.com');
    await page2.type('#loginPassword', 'password123');
    await page2.click('#loginBtn');

    // 3. Superadmin
    const context3 = await browser.createBrowserContext();
    const page3 = await context3.newPage();
    await page3.goto('http://localhost:3000/login');
    await page3.type('#loginEmail', 'superadmin@rankflow.app');
    await page3.type('#loginPassword', 'superadmin123');
    await page3.click('#loginBtn');
    
    // 4. Backend (Prisma Studio)
    const context4 = await browser.createBrowserContext();
    const page4 = await context4.newPage();
    await page4.goto('http://localhost:5555');

    console.log("All tabs opened and logged in. The browser will stay open.");
    
    // Keep the script running indefinitely so the browser doesn't close
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (error) {
    console.error("Error launching browser:", error);
  }
})();
