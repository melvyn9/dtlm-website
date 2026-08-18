#!/usr/bin/env node
/**
 * WCAG 2.2 contrast checker for the DTLM Architect palette.
 *
 * Brief §7: "Architecture sites gravitate toward light grey on white. Body
 * text needs 4.5:1 minimum, large text 3:1. Test every combination; do not
 * eyeball it."
 *
 * This script is that test. Run it with `npm run check:contrast` after
 * changing any colour in src/styles/global.css. It exits non-zero on
 * failure so it can gate a deploy.
 */

const PALETTE = {
  paper: '#fbfbf9',
  'paper-sunk': '#f2f2ee',
  ink: '#16160f',
  'ink-muted': '#55554d',
  'ink-faint': '#6b6b62',
  rule: '#d9d9d2',
  accent: '#7a2f1d',
  'accent-hover': '#57200f',
};

/** Every text pair actually used in the templates. */
const PAIRS = [
  { fg: 'ink', bg: 'paper', use: 'body text', size: 'normal' },
  { fg: 'ink', bg: 'paper-sunk', use: 'body text on sunk panels', size: 'normal' },
  { fg: 'ink-muted', bg: 'paper', use: 'secondary text', size: 'normal' },
  { fg: 'ink-muted', bg: 'paper-sunk', use: 'secondary text on panels', size: 'normal' },
  { fg: 'ink-faint', bg: 'paper', use: 'metadata, eyebrow, captions', size: 'normal' },
  { fg: 'ink-faint', bg: 'paper-sunk', use: 'metadata on panels', size: 'normal' },
  { fg: 'accent', bg: 'paper', use: 'links', size: 'normal' },
  { fg: 'accent', bg: 'paper-sunk', use: 'links on panels', size: 'normal' },
  { fg: 'accent-hover', bg: 'paper', use: 'link hover', size: 'normal' },
  { fg: 'paper', bg: 'ink', use: 'skip link, inverted footer', size: 'normal' },
  { fg: 'paper', bg: 'accent', use: 'button label', size: 'normal' },
];

/**
 * Non-text contrast (WCAG 1.4.11) — UI component boundaries and focus
 * indicators need 3:1 against adjacent colours.
 */
const NON_TEXT = [
  { fg: 'rule', bg: 'paper', use: 'hairline rules (decorative, informational only)', min: 1 },
  { fg: 'ink', bg: 'paper', use: 'focus ring against page', min: 3 },
  { fg: 'ink-faint', bg: 'paper', use: 'form input borders', min: 3 },
];

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

let failures = 0;
const rows = [];

for (const p of PAIRS) {
  const min = p.size === 'large' ? 3 : 4.5;
  const r = ratio(PALETTE[p.fg], PALETTE[p.bg]);
  const pass = r >= min;
  if (!pass) failures++;
  rows.push({
    Pair: `${p.fg} on ${p.bg}`,
    Ratio: r.toFixed(2) + ':1',
    Required: min + ':1',
    Result: pass ? 'PASS' : 'FAIL',
    Usage: p.use,
  });
}

for (const p of NON_TEXT) {
  const r = ratio(PALETTE[p.fg], PALETTE[p.bg]);
  const pass = r >= p.min;
  if (!pass) failures++;
  rows.push({
    Pair: `${p.fg} on ${p.bg}`,
    Ratio: r.toFixed(2) + ':1',
    Required: p.min + ':1',
    Result: pass ? 'PASS' : 'FAIL',
    Usage: p.use + ' [non-text]',
  });
}

console.table(rows);

if (failures > 0) {
  console.error(`\n${failures} contrast failure(s). WCAG 2.2 AA not met — fix before deploying.`);
  process.exit(1);
}

console.log(`\nAll ${rows.length} colour pairs pass WCAG 2.2 AA.`);
