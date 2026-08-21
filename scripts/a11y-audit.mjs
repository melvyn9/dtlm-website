#!/usr/bin/env node
/**
 * Automated accessibility audit for every page template.
 *
 * Brief §7 requires axe/Lighthouse on every template AND manual keyboard and
 * screen reader passes. This script covers the automated third; it does not
 * replace the manual passes, which remain mandatory before launch.
 *
 * It additionally checks the two things most likely to break silently on this
 * site: whether the page still works with JavaScript disabled (§2.1), and
 * whether it stays inside the performance budget (§8).
 *
 * Usage:  node scripts/a11y-audit.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const axeSource = readFileSync(axePath, 'utf8');

const BASE = process.argv[2] ?? 'http://localhost:4321';

/**
 * The site is a single page now — every former standalone route (works,
 * portfolio detail, project-type, about, team, news, contact) is an anchor
 * section on `/`. Only the pages that remain real routes are listed here.
 */
const PAGES = [
  ['/', 'Home'],
  ['/accessibility/', 'Accessibility statement'],
  ['/privacy/', 'Privacy notice'],
  ['/contact/thank-you/', 'Contact thank you'],
  ['/404.html', '404'],
];

const BUDGET_BYTES = 1_000_000; // §8: under 1MB total page weight on first load

let violations = 0;
let budgetFailures = 0;
let jsFailures = 0;

/**
 * CHROMIUM_PATH lets CI or a sandbox point at an already-installed browser.
 * Locally, leave it unset and Playwright uses its own download.
 */
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

console.log(`\nAuditing ${BASE}\n${'='.repeat(70)}`);

for (const [path, label] of PAGES) {
  // ---------------------------------------------------------------- axe ----
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  let transferred = 0;
  page.on('response', async (res) => {
    try {
      const len = Number(res.headers()['content-length'] ?? 0);
      transferred += len || (await res.body().catch(() => Buffer.alloc(0))).length;
    } catch {
      /* ignore */
    }
  });

  await page.goto(BASE + path, { waitUntil: 'networkidle' });

  /**
   * Sections fade up into view (global.css: `.reveal`/`.reveal-onload`).
   * Scanning immediately would sometimes catch text mid-transition — real,
   * but momentary, reduced opacity reads as a contrast violation to axe even
   * though a visitor never rests their eyes on that half-second frame. The
   * longest possible settle time is the reveal's 1s duration plus its
   * longest stagger delay (750ms, the `nth-child(n+6)` cap) — wait that out
   * so the scan reflects the page's steady state, not a transient frame.
   */
  await page.waitForTimeout(1900);

  // Baseline: how much content renders WITH JavaScript, for comparison below.
  const withJs = await page.evaluate(
    () => (document.querySelector('main')?.textContent ?? '').replace(/\s+/g, ' ').trim().length,
  );

  await page.addScriptTag({ content: axeSource });

  const results = await page.evaluate(async () =>
    // @ts-ignore - axe is injected above
    await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    }),
  );

  const v = results.violations;
  violations += v.length;

  const overBudget = transferred > BUDGET_BYTES;
  if (overBudget) budgetFailures++;

  const kb = (transferred / 1024).toFixed(0);
  const status = v.length === 0 ? 'PASS' : `${v.length} VIOLATION(S)`;
  console.log(`\n${label.padEnd(26)} ${path}`);
  console.log(`  axe:     ${status}`);
  console.log(`  weight:  ${kb}KB ${overBudget ? '— OVER 1MB BUDGET' : '(within budget)'}`);

  for (const issue of v) {
    console.log(`    [${issue.impact}] ${issue.id}: ${issue.help}`);
    for (const node of issue.nodes.slice(0, 3)) {
      console.log(`      ${node.html.slice(0, 110)}`);
    }
  }

  await ctx.close();

  // ------------------------------------------------- JavaScript disabled ----
  const noJsCtx = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsCtx.newPage();
  await noJsPage.goto(BASE + path, { waitUntil: 'domcontentloaded' });

  const probe = await noJsPage.evaluate(() => ({
    text: (document.querySelector('main')?.textContent ?? '').replace(/\s+/g, ' ').trim().length,
    navLinks: document.querySelectorAll('header nav a').length,
    h1: document.querySelectorAll('h1').length,
    skipLink: !!document.querySelector('a.skip-link[href="#main"]'),
    landmarks: ['header', 'nav', 'main', 'footer'].every((s) => !!document.querySelector(s)),
  }));

  /**
   * The requirement (§2.1) is that disabling JavaScript changes nothing —
   * not that a page exceeds some arbitrary length. So compare against the
   * same page rendered with JavaScript. A legitimately short page (an empty
   * state, say) passes; a page that loses content without JS fails.
   */
  const parity = withJs === 0 ? probe.text === 0 : probe.text / withJs >= 0.99;
  const jsOk = parity && probe.navLinks > 0 && probe.h1 === 1 && probe.skipLink && probe.landmarks;
  if (!jsOk) jsFailures++;
  console.log(
    `  no-JS:   ${jsOk ? 'PASS' : 'FAIL'} (${probe.text}/${withJs} chars vs JS-on, ${probe.navLinks} nav links, ${probe.h1} h1, skip-link ${probe.skipLink ? 'yes' : 'NO'}, landmarks ${probe.landmarks ? 'yes' : 'NO'})`,
  );

  await noJsCtx.close();
}

// ------------------------------------------------- form without JS --------
const formCtx = await browser.newContext({ javaScriptEnabled: false });
const formPage = await formCtx.newPage();
await formPage.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
const form = await formPage.evaluate(() => {
  const f = document.querySelector('form');
  return {
    exists: !!f,
    method: f?.getAttribute('method')?.toUpperCase(),
    action: f?.getAttribute('action'),
    hasSubmit: !!f?.querySelector('button[type="submit"], input[type="submit"]'),
    honeypot: !!f?.querySelector('[name="botcheck"]'),
    labelled: Array.from(f?.querySelectorAll('input:not([type=hidden]):not([tabindex="-1"]), textarea') ?? []).every(
      (el) => !!document.querySelector(`label[for="${el.id}"]`),
    ),
  };
});
await formCtx.close();

const formOk =
  form.exists && form.method === 'POST' && !!form.action && form.hasSubmit && form.honeypot && form.labelled;
if (!formOk) jsFailures++;

console.log(`\n${'='.repeat(70)}`);
console.log('Contact form with JavaScript disabled:');
console.log(`  plain POST form present: ${form.exists && form.method === 'POST' ? 'yes' : 'NO'}`);
console.log(`  action endpoint set:     ${form.action ? 'yes' : 'NO'}`);
console.log(`  submit control present:  ${form.hasSubmit ? 'yes' : 'NO'}`);
console.log(`  honeypot present:        ${form.honeypot ? 'yes' : 'NO'}`);
console.log(`  every field has a label: ${form.labelled ? 'yes' : 'NO'}`);

// ------------------------------------------------- project popover --------
/**
 * Project detail used to be its own page behind a <details> disclosure; it's
 * now a same-DOM Popover-API panel (ProjectPopover.astro) opened by a
 * <button popovertarget> in the Selected Works grid. `popovertarget` is a
 * declarative HTML attribute, not scripted behaviour, so it must still work
 * with JavaScript disabled — that's the whole point of choosing it over a
 * JS-driven <dialog>.
 *
 * There may legitimately be no trigger — every project is a draft until its
 * alt text, photographer credit and image rights are confirmed, and Selected
 * Works only shows projects flagged `featured: true`. In that case the check
 * is skipped rather than failed, and the run says so.
 */
{
  const pCtx = await browser.newContext({ javaScriptEnabled: false });
  const pPage = await pCtx.newPage();
  await pPage.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

  const trigger = pPage.locator('main button[popovertarget]').first();
  const hasTrigger = (await trigger.count()) > 0;

  if (hasTrigger) {
    const popoverId = await trigger.getAttribute('popovertarget');
    const popover = pPage.locator(`#${popoverId}`);

    const beforeOpen = await popover.evaluate((el) => el.matches(':popover-open'));
    await trigger.click();
    const afterOpen = await popover.evaluate((el) => el.matches(':popover-open'));

    const popoverOk = beforeOpen === false && afterOpen === true;
    if (!popoverOk) jsFailures++;
    console.log(
      `\nProject popover with JavaScript disabled: ${popoverOk ? 'PASS (opens)' : 'FAIL'}`,
    );
  } else {
    console.log(
      '\nProject popover: SKIPPED — no featured, published projects.' +
        '\n  Selected Works only shows projects flagged featured: true. Run' +
        '\n  `PREVIEW_DRAFTS=1 npm run build` first to audit draft projects before launch.',
    );
  }

  await pCtx.close();
}

await browser.close();

console.log(`\n${'='.repeat(70)}`);
console.log(
  `axe violations: ${violations} | pages over budget: ${budgetFailures} | no-JS failures: ${jsFailures}`,
);

if (violations || budgetFailures || jsFailures) {
  console.error('\nAudit FAILED — fix before deploying.');
  process.exit(1);
}
console.log('\nAutomated audit passed. The manual keyboard and screen reader passes are still required (§7).');
