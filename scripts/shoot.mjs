// Screenshots site routes at desktop and mobile width, and reports broken internal links.
// Usage: node scripts/shoot.mjs <origin> <outDir> <route>...
// Routes are site-relative and include the base path, e.g. /omomp-site/ /omomp-site/zh/.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [origin, outDir, ...routes] = process.argv.slice(2);
if (!origin || !outDir || routes.length === 0) {
  console.error("usage: node scripts/shoot.mjs <origin> <outDir> <route>...");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const widths = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
const seen = new Set();
const broken = [];
let failed = false;
const TILE = 1600;
const OVERLAP = 80;

for (const vp of widths) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  page.on("pageerror", (err) => {
    failed = true;
    console.log(`pageerror ${vp.name}: ${err.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      failed = true;
      console.log(`console.error ${vp.name}: ${msg.text()}`);
    }
  });
  for (const route of routes) {
    const res = await page.goto(origin + route, { waitUntil: "networkidle", timeout: 30000 });
    console.log(`${vp.name} ${route} -> ${res?.status()}`);
    if (!res || res.status() >= 400) failed = true;
    const file = `${outDir}/${vp.name}${route.replaceAll("/", "_")}`;
    await page.screenshot({ path: `${file}.png`, fullPage: true });
    // Full-page shots of long pages shrink past legibility when opened, and a full-page capture stretches the viewport
    // to the whole page, which leaves scrolling panes blank. Tiles are real viewport shots scrolled down the page; each
    // overlaps the one before by the sticky header's height plus a margin, so nothing sits hidden under the header.
    await page.setViewportSize({ width: vp.width, height: TILE });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    let tiles = 0;
    for (let y = 0; ; y += TILE - OVERLAP) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${file}.${String(++tiles).padStart(2, "0")}.png` });
      if (y + TILE >= height) break;
    }
    await page.setViewportSize({ width: vp.width, height: vp.height });
    console.log(`  saved ${file}.png and ${tiles} tiles`);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    for (const h of hrefs) {
      if (!h || !h.startsWith("/") || seen.has(h.split("#")[0])) continue;
      const path = h.split("#")[0];
      seen.add(path);
      const r = await page.request.get(origin + path);
      if (r.status() >= 400) broken.push(`${path} (${r.status()}) from ${route}`);
    }
  }
  await page.close();
}
await browser.close();
for (const b of broken) console.log(`broken ${b}`);
console.log(broken.length === 0 && !failed ? "OK" : "FAIL");
process.exit(broken.length === 0 && !failed ? 0 : 1);
