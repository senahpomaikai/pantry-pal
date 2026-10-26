// Saves 390x844 @2x PNGs of key screens for UXtweak image tests (First Click, Five Second, Preference).
// Usage: npm run screenshots   (builds first, then serves dist/ with vite preview)
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const PORT = 4179;
const BASE = `http://localhost:${PORT}/pantry-pal/`;
const VARIANTS = ['a', 'b'];
const SCREENS: [string, string][] = [
  ['01', 'home'], ['02', 'pantry'], ['03', 'add'], ['04', 'scanresult'], ['05', 'recipes'],
  ['06', 'recipe'], ['07', 'cook'], ['08', 'share'], ['09', 'me'],
];

async function waitForServer(url: string, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try { if ((await fetch(url)).ok) return; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('vite preview did not start on ' + url);
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
try {
  await waitForServer(BASE);
  const browser = await chromium.launch();
  for (const v of VARIANTS) {
    await mkdir(`screenshots/${v}`, { recursive: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    for (const [nn, screen] of SCREENS) {
      await page.goto(`${BASE}?task=0&intro=0&frame=0&v=${v}&screen=${screen}`);
      await page.evaluate(() => document.fonts.ready);
      const file = `screenshots/${v}/${nn}-${screen}.png`;
      await page.screenshot({ path: file });
      console.log('saved', file);
    }
    await context.close();
  }
  await browser.close();
} finally {
  server.kill();
}
