// Screenshots external reference pages (Linear, Supabase) at desktop and mobile width for the reviewer.
// Usage: node scripts/refs.mjs <outDir> <url>...
// Scrolls each page to the bottom first so lazy-loaded sections render before the full-page shot.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [outDir, ...urls] = process.argv.slice(2);
if (!outDir || urls.length === 0) {
  console.error("usage: node scripts/refs.mjs <outDir> <url>...");
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const widths = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];
let failed = false;

for (const vp of widths) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  for (const url of urls) {
    const res = await page.goto(url, { waitUntil: "load", timeout: 45000 });
    console.log(`${vp.name} ${url} -> ${res?.status()}`);
    if (!res || res.status() >= 400) {
      failed = true;
      continue;
    }
    for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += vp.height / 2) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(150);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    const { hostname, pathname } = new URL(url);
    const file = `${outDir}/${vp.name}_${hostname}${pathname.replaceAll("/", "_")}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  saved ${file}`);
  }
  await page.close();
}
await browser.close();
console.log(failed ? "FAIL" : "OK");
process.exit(failed ? 1 : 0);
