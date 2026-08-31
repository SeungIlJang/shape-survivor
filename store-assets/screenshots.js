const puppeteer = require('C:/Users/jaeyong/.openclaw/workspace/urgent-toilet-game/node_modules/puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DIR = 'C:/Users/jaeyong/.openclaw/workspace/shape-survivor/store-assets';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  await sleep(1200);

  // 1) title / start screen
  await page.screenshot({ path: DIR + '/shot-1-title.png' });
  console.log('shot-1-title done');

  // start gameplay directly (skip tutorial)
  await page.evaluate(() => { try{ localStorage.setItem('ss_tut','1'); }catch(e){} startGame(); });
  await sleep(6000);
  await page.screenshot({ path: DIR + '/shot-2-play.png' });
  console.log('shot-2-play done');

  await sleep(9000);
  await page.screenshot({ path: DIR + '/shot-3-play.png' });
  console.log('shot-3-play done');

  await sleep(9000);
  await page.screenshot({ path: DIR + '/shot-4-play.png' });
  console.log('shot-4-play done');

  await browser.close();
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
