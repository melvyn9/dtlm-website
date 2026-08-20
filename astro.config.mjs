// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/consts.js';

// DTLM Architect — Astro configuration.
//
// Brief §3: Astro is chosen because it ships zero JavaScript by default.
// Do not add React, Next.js, Gatsby or any SPA framework integration here —
// that would invert the JS-resilience requirement in §2.1.
//
// Brief §10 (language): `i18n` is deliberately configured with a single
// locale. Adding Bahasa Malaysia later means adding 'ms' to `locales` and
// a src/i18n/ms.ts strings file — not restructuring the site.

// GitHub Pages preview build. Set only by .github/workflows/gh-pages.yml, so
// the real production build (Cloudflare Pages) is untouched — this repo's
// production `site` and root-relative paths keep working exactly as before.
const GH_PAGES = process.env.GITHUB_PAGES === 'true';
const GH_PAGES_REPO = 'dtlm-website';

/**
 * Dev-only fix for a real, currently-open Astro bug: index.html files in a
 * public/ subfolder aren't served at their directory path by `astro dev` —
 * only the exact /admin/index.html works, not /admin or /admin/
 * (https://github.com/withastro/astro/issues/14800). This never affects
 * `astro build`/`astro preview` or the real Cloudflare Pages deploy, both of
 * which already serve /admin/ correctly (verified) — it only rewrites the
 * request Vite's own static-file middleware sees during local development,
 * so /admin/config.yml (loaded by the CMS relative to /admin/) still
 * resolves correctly either way.
 */
function adminDevFallback() {
  return {
    name: 'admin-dev-fallback',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/admin' || req.url === '/admin/') {
            req.url = '/admin/index.html';
          }
          next();
        });
      },
    },
  };
}

export default defineConfig({
  site: GH_PAGES ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io` : SITE.url,
  base: GH_PAGES ? `/${GH_PAGES_REPO}` : undefined,

  // Fully static output. The build artifact is plain files, so changing
  // hosts is trivial (§2.6).
  output: 'static',

  // Trailing slashes match the existing WordPress URLs we are preserving.
  trailingSlash: 'always',

  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  // Generates sitemap-index.xml at build time for Google Search Console (§9.7).
  integrations: [sitemap(), adminDevFallback()],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  image: {
    // Build-time image processing. Originals never ship to the browser (§3).
    responsiveStyles: true,
    layout: 'constrained',
  },

  // No prefetch: it would introduce client-side JavaScript on content pages
  // for no benefit on a site this size (§8).
  prefetch: false,

  devToolbar: {
    enabled: false,
  },
});
