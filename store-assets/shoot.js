const puppeteer = require('C:/Users/jaeyong/.openclaw/workspace/urgent-toilet-game/node_modules/puppeteer-core');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DIR = 'C:/Users/jaeyong/.openclaw/workspace/shape-survivor/store-assets';

const fileUrl = p => 'file:///' + p.replace(/\\/g,'/');

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox','--disable-gpu'] });

  // 1) icon 512
  let page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });
  await page.goto(fileUrl(DIR + '/render-icon.html'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: DIR + '/icon-512.png', clip: { x:0, y:0, width:512, height:512 } });
  console.log('icon-512.png done');
  await page.close();

  // 2) feature graphic 1024x500
  page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.goto(fileUrl(DIR + '/render-feature.html'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: DIR + '/feature-1024x500.png', clip: { x:0, y:0, width:1024, height:500 } });
  console.log('feature-1024x500.png done');
  await page.close();

  await browser.close();
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
