// Browser integration: detects unreachable links, hidden/offscreen controls, overlap and print leakage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.json') ? 'application/json' : 'text/html; charset=utf-8');
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const width of [1440, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const file of ['quebec-child-public-school.html', 'portugal-student-family-residence.html', 'canada-parent-study-child.html', 'spain-student-family.html', 'singapore-student-family.html', 'nz-child-overview.html', 'country-canada.html', 'world-k12-pathways-zh.html', 'references.html']) {
        await page.goto(`${base}/${file}`, { waitUntil: 'load' });
        await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, Math.min(2200, document.body.scrollHeight)); });
        const nav = page.getByRole('navigation', { name: '全站快捷导航', exact: true });
        assert(await nav.isVisible(), `${file} ${width}: missing navigation`);
        const state = await nav.evaluate(el => {
          const r = el.getBoundingClientRect();
          return { x:r.x, y:r.y, right:r.right, bottom:r.bottom, position:getComputedStyle(el).position, bodyRight:parseFloat(getComputedStyle(document.body).paddingRight), bodyBottom:parseFloat(getComputedStyle(document.body).paddingBottom) };
        });
        assert.equal(state.position, 'fixed');
        assert(state.x >= 0 && state.y >= 0 && state.right <= width + 1 && state.bottom <= 901, `${file} ${width}: offscreen`);
        if (width > 1100) assert(state.bodyRight >= 152, `${file}: no reserved desktop lane`);
        else assert(state.bodyBottom >= 106, `${file}: footer may be covered`);
        for (const link of await nav.getByRole('link').all()) {
          assert(await link.evaluate(el => { const r=el.getBoundingClientRect(); return r.height>=44 && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }), `${file} ${width}: link obstructed or too small`);
        }
        await nav.getByRole('link', { name: '报告目录 Reports', exact: true }).click();
        await page.waitForURL('**/index.html#report-directory');
        assert(await page.locator('#report-directory').isVisible());
        await page.locator('#report-directory a[href="family-projects.html"]').click();
        await page.waitForURL('**/family-projects.html');
        await page.getByRole('navigation', {name:'全站快捷导航',exact:true}).getByRole('link', { name:'返回首页 Home', exact:true }).click();
        await page.waitForURL('**/index.html');
      }
      console.log(`PASS ${width}px: nine report templates, scroll, directory and home round trips`);
    }
    await page.setViewportSize({width:1440,height:900});
    await page.goto(`${base}/quebec-child-public-school.html#habitual-residence`);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo({top:1000,behavior:'instant'}); });
    await page.screenshot({path:path.join(root,'..','navigation-desktop-qa.png')});
    // A fresh mobile viewport avoids capturing a desktop-to-mobile smooth-scroll transition.
    const mobileContext = await browser.newContext({viewport:{width:390,height:844}});
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${base}/quebec-child-public-school.html`);
    await mobilePage.evaluate(() => { document.documentElement.style.scrollBehavior='auto'; window.scrollTo({top:1000,behavior:'instant'}); });
    await mobilePage.screenshot({path:path.join(root,'..','navigation-mobile-qa.png')});
    await mobileContext.close();
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.site-return-nav').isVisible(), false, 'floating navigation appears in print');
    const noJS = await browser.newContext({javaScriptEnabled:false});
    const staticPage = await noJS.newPage();
    await staticPage.goto(`${base}/quebec-child-public-school.html`);
    await staticPage.getByRole('navigation',{name:'全站快捷导航',exact:true}).getByRole('link',{name:'返回首页 Home',exact:true}).click();
    await staticPage.waitForURL('**/index.html');
    console.log('PASS print hiding and JavaScript-disabled home navigation');
    await noJS.close();
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode=1; });
