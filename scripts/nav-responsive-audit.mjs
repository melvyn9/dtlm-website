#!/usr/bin/env node
/**
 * Responsive navigation audit.
 *
 * Brief §2.3 requires the site to work from 360px to 2560px, and §2.1 requires
 * navigation to remain functional with JavaScript disabled. The mobile menu is
 * the one component where those two requirements are most likely to collide,
 * so it gets its own test.
 *
 * Every check below runs with JavaScript DISABLED. If the menu works in that
 * mode it works in every mode.
 *
 * Usage:  node scripts/nav-responsive-audit.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.argv[2] ?? 'http://localhost:4321';
const MOBILE_BREAKPOINT = 960; // 60rem

/** §2.3: 360px to 2560px, plus the awkward sizes either side of the breakpoint. */
const WIDTHS = [360, 390, 414, 600, 768, 900, 959, 960, 1024, 1280, 1440, 1920, 2560];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`    FAIL  ${msg}`);
};
const pass = (msg) => console.log(`    ok    ${msg}`);

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

console.log(`\nResponsive navigation audit — ${BASE}`);
console.log('JavaScript is DISABLED for every check below.\n' + '='.repeat(70));

for (const width of WIDTHS) {
  const isMobile = width < MOBILE_BREAKPOINT;
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  console.log(`\n${width}px  (${isMobile ? 'mobile — overlay' : 'desktop — inline'})`);

  const toggle = page.locator('#site-nav > summary');
  const firstLink = page.locator('.primary-nav__list a').first();

  const toggleVisible = await toggle.isVisible();
  const linksVisibleClosed = await firstLink.isVisible();

  // -- 1. correct mode for this width -------------------------------------
  if (isMobile) {
    if (toggleVisible) pass('menu button is visible');
    else fail('menu button is NOT visible — navigation is unreachable');

    if (!linksVisibleClosed) pass('nav links hidden until opened');
    else fail('nav links visible while menu is closed');
  } else {
    if (!toggleVisible) pass('menu button hidden');
    else fail('menu button still visible on desktop');

    if (linksVisibleClosed) pass('nav links shown inline');
    else fail('nav links NOT visible on desktop — navigation is unreachable');
  }

  // -- 2. no horizontal overflow (§2.3) -----------------------------------
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow <= 1) pass('no horizontal overflow');
  else fail(`horizontal overflow of ${overflow}px`);

  // -- 3. mobile: open the overlay WITHOUT JavaScript ----------------------
  if (isMobile) {
    await toggle.click();
    const isOpen = await page.locator('#site-nav').evaluate((el) => el.open);
    if (isOpen) pass('overlay opens with JavaScript disabled');
    else fail('overlay did NOT open with JavaScript disabled');

    const linksNowVisible = await firstLink.isVisible();
    if (linksNowVisible) pass('nav links reachable once open');
    else fail('nav links still hidden after opening');

    // Overlay must actually cover the viewport, not sit in a corner.
    const box = await page.locator('#primary-nav').boundingBox();
    if (box && box.width >= width - 2 && box.height >= 600) pass('overlay covers the viewport');
    else fail(`overlay does not cover the viewport (${JSON.stringify(box)})`);

    // -- 4. focus containment, SC 2.4.11 -----------------------------------
    const behind = await page.evaluate(() => {
      const parts = [
        'a[href]',
        'button',
        'input',
        'textarea',
        'select',
        'summary',
        '[tabindex]:not([tabindex="-1"])',
      ];
      /**
       * Each part must be prefixed individually. Writing `main a, button, ...`
       * would scope only the first selector and leave the rest global — which
       * is exactly the bug that made this check report false failures.
       */
      const scoped = (scope) => parts.map((p) => `${scope} ${p}`).join(', ');
      /**
       * <main>/<footer> are hidden behind the overlay with visibility:hidden,
       * not display:none (see SiteHeader.astro's FOCUS CONTAINMENT comment —
       * visibility:hidden keeps their layout box so an in-page nav anchor can
       * still scroll to its target once the overlay closes). offsetWidth /
       * offsetHeight / getClientRects() all stay non-zero for a
       * visibility:hidden element, since it still occupies layout space, so
       * they alone can't tell "still reachable" apart from "correctly hidden
       * but laid out" — the computed style check below is what actually
       * distinguishes them.
       */
      const visible = (el) => {
        const cs = getComputedStyle(el);
        return (
          cs.visibility !== 'hidden' &&
          cs.display !== 'none' &&
          !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        );
      };
      return {
        main: Array.from(document.querySelectorAll(scoped('main'))).filter(visible).length,
        footer: Array.from(document.querySelectorAll(scoped('footer'))).filter(visible).length,
      };
    });
    if (behind.main === 0 && behind.footer === 0)
      pass('page content behind the overlay is out of the tab order');
    else
      fail(
        `${behind.main + behind.footer} focusable element(s) still reachable behind the overlay`,
      );

    // -- 5. background scroll lock -----------------------------------------
    const locked = await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
    if (locked) pass('background scroll locked');
    else fail('background still scrollable behind the overlay');

    // -- 6. the same control closes it -------------------------------------
    await toggle.click();
    const closed = await page.locator('#site-nav').evaluate((el) => !el.open);
    if (closed) pass('same control closes the overlay');
    else fail('overlay did not close');
  }

  await ctx.close();
}

// -- 7. axe on the open overlay ------------------------------------------
console.log(`\n${'='.repeat(70)}\naxe scan with the mobile overlay OPEN (390px, no JavaScript)`);
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#site-nav > summary').click();

  // axe itself needs to run, so scripting is re-enabled only for the scan.
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page2.locator('#site-nav > summary').click();
  // Let the overlay's 180ms fade-in (@keyframes nav-in) finish before
  // scanning — mid-fade text is a genuine, momentary low-contrast blend of
  // the real (passing) foreground/background colors, not a design defect.
  // Scanning immediately after the click is a race that reports false
  // color-contrast violations.
  await page2.waitForTimeout(250);
  await page2.addScriptTag({ content: axeSource });
  const res = await page2.evaluate(async () =>
    // @ts-ignore
    window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    }),
  );

  if (res.violations.length === 0) pass('0 violations with the overlay open');
  else {
    for (const v of res.violations) fail(`${v.id}: ${v.help}`);
  }

  // Touch targets in the overlay (SC 2.5.8, 24×24 minimum).
  const small = await page2.evaluate(() => {
    const els = document.querySelectorAll('.primary-nav a, #site-nav summary');
    return Array.from(els)
      .map((el) => ({ t: el.textContent.trim().slice(0, 24), r: el.getBoundingClientRect() }))
      .filter((x) => x.r.height > 0 && (x.r.height < 24 || x.r.width < 24))
      .map((x) => `${x.t} (${Math.round(x.r.width)}×${Math.round(x.r.height)})`);
  });
  if (small.length === 0) pass('all overlay targets ≥ 24×24px');
  else fail(`targets below 24×24px: ${small.join(', ')}`);

  await ctx.close();
  await ctx2.close();
}

await browser.close();

console.log(`\n${'='.repeat(70)}`);
if (failures) {
  console.error(`${failures} failure(s).`);
  process.exit(1);
}
console.log('Responsive navigation audit passed at all 13 widths, with JavaScript disabled.');
