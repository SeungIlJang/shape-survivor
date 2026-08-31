const puppeteer = require('C:/Users/jaeyong/.openclaw/workspace/urgent-toilet-game/node_modules/puppeteer-core');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DIR = 'C:/Users/jaeyong/.openclaw/workspace/shape-survivor/store-assets';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox','--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  await sleep(1000);

  // start, skip tutorial
  await page.evaluate(() => { try{ localStorage.setItem('ss_tut','1'); }catch(e){} startGame(); });

  let gotLevelup = false, gotBoss = false, gotDense = false;
  const t0 = Date.now();
  let ang = 0;
  while (Date.now() - t0 < 75000) {
    // roam in a slow circle to collect gems and dodge
    ang += 0.25;
    await page.evaluate(a => {
      try {
        moveDir.x = Math.cos(a) * 0.9;
        moveDir.y = Math.sin(a) * 0.9;
      } catch(e){}
    }, ang);

    const st = await page.evaluate(() => ({
      state: (typeof state!=='undefined')?state:'?',
      enemies: (typeof enemies!=='undefined')?enemies.length:0,
      boss: (typeof enemies!=='undefined')?enemies.some(e=>e.boss):false,
      lv: (typeof player!=='undefined')?player.lv:0
    }));

    if (st.state === 'levelup' && !gotLevelup) {
      await sleep(250);
      await page.screenshot({ path: DIR + '/shot-5-levelup.png' });
      console.log('shot-5-levelup done (lv', st.lv, ')');
      gotLevelup = true;
      // pick first upgrade to continue
      await page.evaluate(() => {
        const cards = document.querySelectorAll('#levelup .card, #levelup .btn');
        if (cards[0]) cards[0].click();
      });
      await sleep(300);
    }

    if (st.boss && !gotBoss) {
      await sleep(200);
      await page.screenshot({ path: DIR + '/shot-6-boss.png' });
      console.log('shot-6-boss done');
      gotBoss = true;
    }

    if (st.enemies >= 12 && !gotDense) {
      await page.screenshot({ path: DIR + '/shot-7-dense.png' });
      console.log('shot-7-dense done (enemies', st.enemies, ')');
      gotDense = true;
    }

    if (st.state === 'over') { console.log('player died at', ((Date.now()-t0)/1000)|0, 's'); break; }
    await sleep(180);
  }

  await browser.close();
  console.log('DONE. levelup=%s boss=%s dense=%s', gotLevelup, gotBoss, gotDense);
})().catch(e => { console.error(e); process.exit(1); });
