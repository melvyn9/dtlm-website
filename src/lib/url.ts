/**
 * Prefixes a root-relative path with Astro's configured `base`.
 *
 * Production (Cloudflare Pages) has no base, so this is a no-op there —
 * it only does anything on the GitHub Pages preview build, which serves
 * from a /repo-name/ subpath (see astro.config.mjs).
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
