import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections for DTLM Architect.
 *
 * Brief §6: "Fields marked required must be enforced by Astro's content
 * collection schema so a build fails rather than shipping incomplete data."
 *
 * Brief §12: "Enforce heroImageAlt and photographer in the content schema so
 * builds fail on omission."
 *
 * The schema below is therefore intentionally strict. If a build fails here,
 * that is the schema doing its job — fix the content, do not relax the rule.
 */

const TYPOLOGIES = [
  'residential',
  'commercial',
  'civic',
  'institutional',
  'interior',
] as const;

const STATUSES = ['built', 'under-construction', 'competition', 'unbuilt'] as const;

/** Words too generic to be meaningful alt text on an architecture site. */
const LAZY_ALT = [
  'image',
  'photo',
  'photograph',
  'picture',
  'project',
  'building',
  'architecture',
  'house',
  'exterior',
  'interior',
  'view',
];

/**
 * Detects unfilled placeholders. Anything in square brackets, or the words
 * TODO / TBC / TBA / FIXME, means the field has not actually been written.
 */
const PLACEHOLDER = /\[[^\]]*\]|\b(TODO|TBC|TBA|FIXME|CONFIRM)\b/i;

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1, 'title is required'),

        /**
         * URL-safe slug. This must match the project's existing WordPress
         * slug at /portfolio/[slug]/ — the client chose to preserve existing
         * project URLs rather than adopt the /projects/ structure in §4, so
         * changing a slug here breaks an indexed URL.
         */
        slug: z
          .string()
          .min(1, 'slug is required')
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'slug must be lowercase letters, numbers and single hyphens only',
          ),

        year: z
          .number()
          .int()
          .min(1960, 'year looks too early — check it')
          .max(new Date().getFullYear() + 10, 'year is implausibly far in the future'),

        /** City, country. */
        location: z.string().min(1, 'location is required — city, country'),

        /** Optional: check confidentiality before naming a client (§6). */
        client: z.string().optional(),

        status: z.enum(STATUSES, {
          message: `status must be one of: ${STATUSES.join(' | ')}`,
        }),

        typology: z.enum(TYPOLOGIES, {
          message: `typology must be one of: ${TYPOLOGIES.join(' | ')}`,
        }),

        /**
         * Gross floor area in square metres. `.nullable()` alongside
         * `.optional()` is deliberate: the CMS's number widget writes an
         * explicit `null` into frontmatter when left empty (not a missing
         * key), so both must mean "not specified" here — this doesn't
         * accept anything a plain `.optional()` wouldn't already permit in
         * spirit, it just also accepts the literal value the CMS produces.
         */
        area: z.number().positive().optional().nullable(),

        /** Short summary used on cards and in meta description. */
        description: z
          .string()
          .min(20, 'description is required and should be a real sentence'),

        heroImage: image(),

        /**
         * REQUIRED. Brief §7 identifies alt text as the WCAG criterion most
         * likely to fail on an image-led site, and states that "the only
         * reliable fix is making it impossible to publish without".
         *
         * Rules enforced below:
         *  - at least 15 characters
         *  - must not simply repeat the project title
         *  - must not be a single generic word like "building" or "exterior"
         *  - must not start with "image of" / "photo of" (screen readers
         *    already announce that it is an image)
         */
        heroImageAlt: z
          .string()
          .min(15, 'heroImageAlt must describe the architectural subject, not just name it')
          .refine(
            (v) => !/^\s*(an?\s+)?(image|photo|photograph|picture)\s+of\b/i.test(v),
            'heroImageAlt should not start with "image of" / "photo of" — screen readers already announce that it is an image',
          )
          .refine(
            (v) => !LAZY_ALT.includes(normalise(v)),
            'heroImageAlt is too generic — describe what is actually in the frame',
          ),

        /**
         * REQUIRED. Brief §6: "architectural photography is licensed, and
         * credit lines are typically contractual... This is a legal exposure,
         * not a nicety."
         *
         * Use the literal value "In-house" for photography shot by the
         * practice. An empty or placeholder value fails the build on purpose.
         */
        photographer: z
          .string()
          .min(2, 'photographer is required — use "In-house" if shot by the practice')
          .refine(
            (v) => !/^\s*(tbc|tba|todo|unknown|n\/?a|\?+)\s*$/i.test(v),
            'photographer must name a person or studio, or "In-house" — placeholders are not allowed to ship',
          ),

        /**
         * Confirmation that the practice holds web usage rights for this
         * image (§6). Must be explicitly true before a project can publish.
         */
        imageRightsConfirmed: z.boolean().default(false),

        awards: z.array(z.string()).default([]),

        publications: z
          .array(
            z.object({
              title: z.string(),
              publisher: z.string().optional(),
              /**
               * Free text — "March 2024", "Vol.36 Issue 1, 2024", or just a
               * year. Coerced to a string so that writing `date: 2024`
               * unquoted in YAML (which parses as a number) does not fail the
               * build. §2.5: this must be maintainable by a non-developer.
               */
              date: z.coerce.string().optional(),
              url: z.string().url().optional(),
            }),
          )
          .default([]),

        team: z.array(z.string()).default([]),
        consultants: z.array(z.string()).default([]),

        /** Surface on the homepage. */
        featured: z.boolean().default(false),

        /** Manual sort control. Lower numbers sort first. */
        order: z.number().int().default(999),

        /** Set true to keep a project out of the build without deleting it. */
        draft: z.boolean().default(false),
      })
      .superRefine((data, ctx) => {
        // Alt text must not simply restate the title (§7).
        if (normalise(data.heroImageAlt) === normalise(data.title)) {
          ctx.addIssue({
            code: 'custom',
            path: ['heroImageAlt'],
            message:
              'heroImageAlt repeats the project title. Describe the architectural subject instead — what would someone who cannot see this image need to know?',
          });
        }

        /**
         * Publication gate.
         *
         * Content still being worked on legitimately contains placeholders,
         * so those are permitted while `draft: true`. The moment a project is
         * marked publishable, every placeholder becomes a build failure.
         *
         * This is the mechanism that makes §7's requirement real: it is
         * literally not possible to publish a project with unwritten alt text
         * or an unconfirmed photographer credit.
         */
        if (data.draft) return;

        for (const field of ['heroImageAlt', 'photographer', 'title', 'location'] as const) {
          if (PLACEHOLDER.test(data[field])) {
            ctx.addIssue({
              code: 'custom',
              path: [field],
              message: `${field} still contains a placeholder. Fill it in, or set "draft: true" to keep this project out of the production build.`,
            });
          }
        }

        // §6: web usage rights are a legal exposure, not a nicety.
        if (!data.imageRightsConfirmed) {
          ctx.addIssue({
            code: 'custom',
            path: ['imageRightsConfirmed'],
            message:
              'imageRightsConfirmed must be true before this project can publish. Confirm the practice holds web usage rights for the hero image and that the credit line matches the licence, then set it to true. Until then set "draft: true".',
          });
        }
      }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      /** Lower numbers sort first. The principal should be 1. */
      order: z.number().int().default(99),
      headshot: image().optional(),
      /** Required whenever a headshot is present — enforced below. */
      headshotAlt: z.string().min(10).optional(),
      credentials: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }).superRefine((data, ctx) => {
      if (data.headshot && !data.headshotAlt) {
        ctx.addIssue({
          code: 'custom',
          path: ['headshotAlt'],
          message: 'headshotAlt is required when a headshot is present (§7: every image needs alt text)',
        });
      }
    }),
});

/**
 * Awards, publications and speaking engagements.
 *
 * Brief §5 — the client selected Option 2: a single curated page with
 * outbound links, rather than a full migration of the WordPress archive.
 */
const press = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/press' }),
  schema: z.object({
    title: z.string().min(1),
    /**
     * Drives grouping on the homepage's press sections. `museum` and `book`
     * have no entries yet — those sections render an empty/coming-soon
     * state until real content is added.
     */
    kind: z.enum(['award', 'publication', 'speaking', 'museum', 'book']),
    /** Publication or awarding body. */
    source: z.string().min(1),
    /**
     * Optional on purpose: several items in the existing archive are not
     * dated, and a required date field would only invite invented ones.
     * Undated items sort to the end of their group.
     */
    date: z.coerce.date().optional(),
    /** Free-text date when only an issue or week is known, e.g. "Vol.36 Issue 1, 2024". */
    dateNote: z.string().optional(),
    /** Outbound link to the original coverage. */
    url: z.string().url().optional(),
    /** Optional slug of a related project. */
    project: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, team, press };
