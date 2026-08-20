/**
 * DTLM Architect — single source of truth for site-wide configuration.
 *
 * Brief §3 requires image paths to stay "abstracted behind a single config
 * value" so that a future move to Cloudflare Images or S3 + CloudFront is a
 * one-file change. That value is IMAGES.baseUrl below.
 *
 * Anything a non-developer might reasonably need to change lives here rather
 * than being scattered through templates (§2.5).
 */

export const SITE = {
  /**
   * Display name. Brief §10 recorded this as an open item; the client
   * confirmed "DTLM Architect" on 14 Aug 2026.
   *
   * NOTE: the existing site brands itself "DRTAN LM Architect" / "DRTANLM
   * ARCHITECT". Confirm the exact legal form with the practice before launch —
   * this string appears in page titles, the footer, structured data and the
   * accessibility statement.
   */
  name: 'DrTanLM Architect (DTLMA)',

  /** Longer form used where the principal's credentials add weight. */
  legalName: 'DRTAN LM Architect',

  principal: 'Ar. Dr. Tan Loke Mun',

  tagline: 'Creating places for people',

  description:
    'DTLM Architect is a Kuala Lumpur architectural practice led by Ar. Dr. Tan Loke Mun, recipient of the PAM Gold Medal 2025.',

  url: 'https://dtlm.com.my',

  lang: 'en',
  locale: 'en_MY',
};

/**
 * Contact details.
 *
 * TODO(unverified): address, phone and email could not be read from the
 * existing site during the Phase 0 audit — its robots.txt was returning
 * HTTP 508 and the /contact/ page fetch failed. These are placeholders and
 * MUST be confirmed with the practice before launch. They are deliberately
 * obvious rather than plausible, so they cannot ship unnoticed.
 */
export const CONTACT = {
  addressLines: ['[CONFIRM ADDRESS LINE 1]', '[CONFIRM ADDRESS LINE 2]', 'Kuala Lumpur, Malaysia'],
  phone: '[CONFIRM PHONE]',
  phoneHref: '',
  email: '[CONFIRM EMAIL]',

  /**
   * Static map image linked to Google Maps. Brief §4 forbids an embedded
   * Google Maps iframe — heavy third-party JS and an accessibility problem.
   */
  mapImage: '/images/map-static.png',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=Kuala+Lumpur',

  /** Set to false until CONTACT details above are confirmed. */
  verified: false,
};

/**
 * Contact form endpoint (brief §3).
 *
 * Must be a plain <form action method="POST"> that submits without
 * JavaScript. Do NOT reimplement as a fetch handler.
 *
 * TODO: create the Web3Forms account and paste the access key here. Confirm
 * the endpoint's data handling is acceptable before committing (§3), and
 * make sure the privacy notice reflects it (§10).
 */
export const FORM = {
  provider: 'web3forms',
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: '[CONFIRM WEB3FORMS ACCESS KEY]',
  /** Where the user lands after a successful non-JS submit. */
  redirectTo: 'https://dtlm.com.my/contact/thank-you/',
  honeypotField: 'botcheck',
  configured: false,
};

/**
 * Image delivery. Change `baseUrl` to a CDN origin if total image weight
 * approaches ~500MB (§3 migration trigger). Empty string = serve from the
 * same origin, which is correct at current scale.
 */
export const IMAGES = {
  baseUrl: '',
  maxSourceLongEdge: 2500,
  maxSourceBytes: 2 * 1024 * 1024,
};

/**
 * Analytics. Cookieless by requirement (§3) so no consent banner is needed.
 * Cloudflare Web Analytics injects its own script tag at the edge when
 * enabled in the Cloudflare dashboard — nothing needs adding to the markup.
 */
export const ANALYTICS = {
  provider: 'cloudflare-web-analytics',
  enabledAtEdge: true,
};

/**
 * Primary navigation.
 *
 * The site is a single scrollable page now — every item is a same-page
 * anchor into index.astro, not a separate route. Hrefs are root-relative
 * (`/#id`, not bare `#id`) so they still resolve correctly from the
 * standalone pages that remain real routes (accessibility, privacy,
 * contact/thank-you, 404) — a bare `#id` there would try to scroll within a
 * page that has no matching element.
 */
export const NAV = [
  { href: '/#selected-works', key: 'nav.works' },
  { href: '/#awards', key: 'nav.awards' },
  { href: '/#news', key: 'nav.news' },
  { href: '/#museums', key: 'nav.museums' },
  { href: '/#books', key: 'nav.books' },
  { href: '/#contact', key: 'nav.contact' },
];

export const FOOTER_NAV = [
  { href: '/accessibility/', key: 'nav.accessibility' },
  { href: '/privacy/', key: 'nav.privacy' },
];

/** Typology values. Must stay in sync with the enum in src/content.config.ts. */
export const TYPOLOGIES = [
  'residential',
  'commercial',
  'civic',
  'institutional',
  'interior',
];

export const STATUSES = ['built', 'under-construction', 'competition', 'unbuilt'];
