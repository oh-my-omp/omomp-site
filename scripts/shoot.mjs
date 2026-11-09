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
    // Full-page shots of long pages shrink past legibility when opened; tiles keep near-native resolution.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, n = 1; y < height; y += TILE, n++) {
      await page.screenshot({ path: `${file}.${String(n).padStart(2, "0")}.png`, fullPage: true, clip: { x: 0, y, width: vp.width, height: Math.min(TILE, height - y) } });
    }
    console.log(`  saved ${file}.png and ${Math.ceil(height / TILE)} tiles`);
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
