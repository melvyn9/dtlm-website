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
 * Find a published project page to audit, if there is one.
 *
 * There may legitimately be none — every project is a draft until its alt
 * text, photographer credit and image rights are confirmed. In that case the
 * project-detail checks are skipped rather than failed, and the run says so.
 */
async function findProjectPage() {
  try {
    const res = await fetch(`${BASE}/sitemap-0.xml`);
    if (!res.ok) return null;
    const xml = await res.text();
    const match = xml.match(/<loc>[^<]*(\/portfolio\/[^<]+)<\/loc>/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const projectPage = await findProjectPage();

const PAGES = [
  ['/', 'Home'],
  ['/works/', 'Works index'],
  ...(projectPage ? [[projectPage, 'Project detail']] : []),
  ['/project-type/residential/', 'Typology filter'],
  ['/team/', 'Team'],
  ['/about/', 'About'],
  ['/contact/', 'Contact'],
  ['/news/', 'News & Press'],
  ['/accessibility/', 'Accessibility statement'],
  ['/privacy/', 'Privacy notice'],
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
await formPage.goto(BASE + '/contact/', { waitUntil: 'domcontentloaded' });
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

// ---------------------------------------------------- details/summary -----
if (projectPage) {
  const dCtx = await browser.newContext({ javaScriptEnabled: false });
  const dPage = await dCtx.newPage();
  await dPage.goto(BASE + projectPage, { waitUntil: 'domcontentloaded' });

  /**
   * Scoped to `main`. The site header also contains a <details> — it is the
   * state container for the mobile navigation overlay — and an unscoped
   * `details` selector matches that one first, since the header precedes
   * <main> in the document.
   */
  const details = dPage.locator('main details').first();
  const before = await details.evaluate((el) => el.open);
  await dPage.locator('main details > summary').first().click();
  const after = await details.evaluate((el) => el.open);
  await dCtx.close();

  const detailsOk = before === false && after === true;
  if (!detailsOk) jsFailures++;
  console.log(
    `\nExpandable detail panel with JavaScript disabled: ${detailsOk ? 'PASS (opens)' : 'FAIL'}`,
  );
} else {
  console.log(
    '\nExpandable detail panel: SKIPPED — no published projects.' +
      '\n  Every project is currently a draft. Run `PREVIEW_DRAFTS=1 npm run build`' +
      '\n  first to audit project pages before they go live.',
  );
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
