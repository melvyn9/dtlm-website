import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Draft handling.
 *
 * Drafts render when previewing locally (`npm run dev`) so work in progress
 * can be reviewed, and are excluded from the production build (`npm run
 * build`) so it cannot reach the live site.
 *
 * Do not "simplify" this by removing the PROD check — that is the only thing
 * standing between an unconfirmed photographer credit and publication (§6).
 */
/**
 * Set PREVIEW_DRAFTS=1 to include drafts in a production build. This exists
 * for the staging deployment the brief asks for in §9.5 — a Cloudflare Pages
 * preview URL where the practice can review unfinished projects before sign
 * off.
 *
 * Never set this on the production deployment.
 */
const FORCE_DRAFTS = import.meta.env.PREVIEW_DRAFTS === '1';

const SHOW_DRAFTS = !import.meta.env.PROD || FORCE_DRAFTS;

export const isPreview = SHOW_DRAFTS;

export async function getProjects() {
  const all = await getCollection('projects', ({ data }) => SHOW_DRAFTS || !data.draft);
  return all.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return b.data.year - a.data.year;
  });
}

export async function getFeaturedProjects(limit = 6) {
  const projects = await getProjects();
  return projects.filter((p) => p.data.featured).slice(0, limit);
}

export async function getTeam() {
  const all = await getCollection('team', ({ data }) => SHOW_DRAFTS || !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getPress() {
  const all = await getCollection('press', ({ data }) => SHOW_DRAFTS || !data.draft);
  return all.sort((a, b) => {
    // Undated items sort to the end of their group rather than to the top.
    const at = a.data.date?.getTime();
    const bt = b.data.date?.getTime();
    if (at === undefined && bt === undefined) return a.data.title.localeCompare(b.data.title);
    if (at === undefined) return 1;
    if (bt === undefined) return -1;
    return bt - at;
  });
}

/** Homepage hero gallery images, in display/cycle order. Empty if none set. */
export async function getHero() {
  const entry = (await getCollection('hero'))[0];
  return entry?.data.images ?? [];
}

export type Project = CollectionEntry<'projects'>;
export type TeamMember = CollectionEntry<'team'>;
export type PressItem = CollectionEntry<'press'>;

/** Human-readable date, or the free-text note when only an issue is known. */
export function formatPressDate(item: PressItem): string | undefined {
  if (item.data.dateNote) return item.data.dateNote;
  if (!item.data.date) return undefined;
  return item.data.date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
