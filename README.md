# DTLM Architect — website

The practice website for DTLM Architect, Kuala Lumpur. It is a **static site**:
there is no database, no CMS login, and no server to maintain. Content lives in
text files in this folder, and the site is rebuilt automatically whenever those
files change.

This document is written for a tech-savvy person who is not a developer. If you
can edit a text file and use a web browser, you can maintain this site.

**Running cost: the domain renewal. Nothing else.**

---

## Contents

1. [Before you start](#1-before-you-start)
2. [How to preview the site on your own computer](#2-how-to-preview-the-site-on-your-own-computer)
3. [How to add a new project](#3-how-to-add-a-new-project)
4. [How to add a team member](#4-how-to-add-a-team-member)
5. [How to add an award or press mention](#5-how-to-add-an-award-or-press-mention)
6. [Preparing images](#6-preparing-images)
7. [How to write good alt text](#7-how-to-write-good-alt-text)
8. [How deployment works](#8-how-deployment-works)
9. [How to roll back a bad deploy](#9-how-to-roll-back-a-bad-deploy)
10. [Where the accounts live](#10-where-the-accounts-live)
11. [Pre-publication checklist](#11-pre-publication-checklist)
12. [If the build fails](#12-if-the-build-fails)
13. [For developers](#13-for-developers)

---

## 1. Before you start

You need two things installed:

- **[Node.js](https://nodejs.org/)** version 20 or later. Download the "LTS"
  version and accept all the defaults.
- **A text editor.** [VS Code](https://code.visualstudio.com/) is free and
  works well. Notepad will also do, but a proper editor will warn you when
  something is wrong.

Then, once only, open a terminal in this folder and run:

```bash
npm install
```

This downloads the tools the site is built with. It takes a minute or two and
you only ever need to do it again if someone changes the project's
dependencies.

### The two rules

1. **Never edit anything inside `dist/` or `node_modules/`.** Both folders are
   generated. Your changes there will be wiped out.
2. **Everything you will ever need to edit is inside `src/`.**

---

## 2. How to preview the site on your own computer

```bash
npm run dev
```

Then open <http://localhost:4321> in your browser.

Leave that terminal window running. As you edit files and save them, the
browser updates by itself. Press `Ctrl+C` in the terminal to stop.

> **Draft content is visible in preview.** You will see an amber bar at the top
> of the page saying so. Anything marked `draft: true` shows up here and is
> **excluded from the live site**. That is deliberate — it lets you work on a
> project over several sittings without it appearing publicly.

---

## 3. How to add a new project

### Step 1 — prepare the image

Read [section 6](#6-preparing-images) first. Save the finished image into:

```
src/assets/projects/
```

Name it after the project, in lowercase with hyphens: `verandah-house.jpg`

### Step 2 — copy the template

In `src/content/projects/` you will find `_TEMPLATE.md.txt`.

Copy it, and rename the copy to match your project — **ending in `.md`, not
`.md.txt`**:

```
src/content/projects/verandah-house.md
```

### Step 3 — fill it in

Open your new file. Everything between the two `---` lines at the top is the
project's information. Everything below is the project's written description.

The template explains each field. The important ones:

| Field | Notes |
|---|---|
| `slug` | Becomes the URL: `verandah-house` → `dtlm.com.my/portfolio/verandah-house/`. **If the project already exists on the old site, use exactly the same slug** — changing it breaks the link and loses its Google ranking. |
| `year`, `location`, `status`, `typology` | All required. `status` and `typology` must be one of the listed values, spelled exactly. |
| `heroImageAlt` | Required. See [section 7](#7-how-to-write-good-alt-text). |
| `photographer` | Required. The photographer's name, or `In-house`. |
| `imageRightsConfirmed` | Must be `true` before the project can go live. Only set this once you have actually checked. |
| `featured` | `true` puts it on the homepage. |
| `order` | Lower numbers appear first. |
| `draft` | `true` while you are still working. Set to `false` to publish. |

### Step 4 — preview it

With `npm run dev` running, visit <http://localhost:4321/works/>. Your project
should be there.

### Step 5 — publish it

Work through the [pre-publication checklist](#11-pre-publication-checklist),
then change `draft: true` to `draft: false`, save, and follow
[section 8](#8-how-deployment-works).

> **The site will refuse to build if a project is incomplete.** If you set
> `draft: false` while alt text is still unwritten, the photographer is
> unconfirmed, or image rights are not ticked, the build stops with a message
> naming the problem. This is on purpose — see [section 12](#12-if-the-build-fails).

---

## 4. How to add a team member

Exactly the same pattern.

1. Save a headshot into `src/assets/team/` — square crop, max 1200px, under
   500KB. Name it `firstname-lastname.jpg`.
2. Copy `src/content/team/_TEMPLATE.md.txt` to
   `src/content/team/firstname-lastname.md`.
3. Fill in `name`, `role`, and `order` (the principal is `1`, everyone else
   counts up from there).
4. If you included a headshot, `headshotAlt` is **required** — the build will
   fail without it.
5. Write the biography below the second `---`.
6. Set `draft: false` when ready.

To remove someone, either delete their file or set `draft: true`.

---

## 5. How to add an award or press mention

Create a new file in `src/content/press/`. Name it after the item, e.g.
`pam-gold-medal-2025.md`. It only needs the header block:

```yaml
---
title: Ar. Dr. Tan Loke Mun awarded the PAM Gold Medal 2025
kind: award
source: Pertubuhan Akitek Malaysia (PAM)
date: 2025-08-23
url: https://www.thestar.com.my/lifestyle/people/2025/08/23/...
featured: true
---
```

| Field | Notes |
|---|---|
| `kind` | One of `award`, `publication`, `speaking`. This decides which section of the News & Press page it appears in. |
| `source` | The publication or awarding body. |
| `date` | Format `YYYY-MM-DD`. Optional — leave it out if you do not know it. |
| `dateNote` | Use instead of `date` when only an issue is known, e.g. `"Vol.36, Issue 1, 2024"`. |
| `url` | Link to the original coverage. Optional but strongly preferred. |
| `featured` | `true` also shows it on the homepage. |

---

## 6. Preparing images

Getting this right is the single biggest thing you can do for the site's speed.

### The rules

| | |
|---|---|
| **Format** | JPEG for photographs. PNG only for drawings or diagrams. |
| **Longest edge** | **2500 pixels maximum** |
| **File size** | **Under 2MB** — aim for under 1MB |
| **Filename** | lowercase, hyphens, no spaces: `verandah-house-courtyard.jpg` |
| **Colour** | sRGB |

### Do not commit photographer originals

A 40MB RAW export or full-resolution TIFF does not belong in this folder. Keep
those in the practice's own archive. This repository has a size limit, and
files added to it are difficult to remove afterwards.

### You do not need to make small versions

The site does that automatically. When it builds, it generates AVIF and WebP
copies at several widths and serves whichever is smallest for the visitor's
screen. Your original is never sent to a browser. Add one good image at the
size above and the rest is handled.

### How to resize

- **macOS:** open in Preview → Tools → Adjust Size → set the longest side to
  2500 → File → Export → JPEG, Quality around 80%.
- **Windows:** open in Photos → Edit → Resize.
- **Photoshop:** File → Export → Save for Web, JPEG, Quality 75–85.

---

## 7. How to write good alt text

Alt text is what a blind visitor's screen reader reads aloud in place of the
image. It is also what appears if the image fails to load, and it is the single
accessibility requirement most likely to be got wrong on a site like this one.

### The question to ask

> If I were describing this photograph to someone over the phone, in one
> sentence, what would I say?

### The rules

- **Describe the architectural subject**, not the project name. The title is
  already on the page.
- **Do not start with "Image of" or "Photo of."** Screen readers already
  announce that it is an image. *The build will reject alt text that does.*
- **Do not repeat the project title.** *The build will reject that too.*
- One sentence is usually right. No full stop needed.
- If an image is purely decorative and carries no information, it should have
  empty alt text (`alt=""`) — ask a developer to set that.

### Three worked examples

**Example 1 — Clay Roof House**

- ❌ `Clay Roof House`
  Repeats the title. Tells a blind visitor nothing they did not already know.
- ❌ `Image of a modern house exterior`
  Starts with "Image of", and "modern house exterior" could be any building.
- ✅ `Facade of salvaged terracotta roof tiles hung on vertical steel rods, pivoting freely in front of full-height glazing`
  Describes what is actually there and conveys the idea the photograph exists to show.

**Example 2 — an interior**

- ❌ `Interior`
  Meaningless.
- ❌ `Beautiful award-winning living space with stunning natural light`
  Adjectives, not description. "Beautiful" is not information.
- ✅ `Double-height living room with a board-marked concrete wall, timber ceiling battens and a full-width sliding door open to a courtyard`

**Example 3 — a site or context photograph**

- ❌ `Photo of the building from outside`
- ❌ `Verandah House exterior view 3`
  A filename, not a description.
- ✅ `Two-storey house set back behind mature rain trees, its upper floor screened by vertical timber louvres`

### A useful test

Read your alt text aloud with your eyes shut. If you cannot picture the
building, rewrite it.

---

## 8. How deployment works

The site is hosted on **Cloudflare Pages** and deploys automatically from
GitHub. You never upload files by hand.

### To publish your changes

```bash
git add .
git commit -m "Add Verandah House project"
git push
```

That is it. Cloudflare notices the push, rebuilds the site, and publishes it —
usually within two minutes.

### How to confirm it worked

1. Go to the **Cloudflare dashboard → Workers & Pages → the site → Deployments**.
2. The newest deployment should say **Success**. A build takes 1–2 minutes.
   - **Success** → visit the live site and confirm your change is there. Do a
     hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) if you still see the old
     version.
   - **Failed** → click into it and read the log. The error is almost always
     a content mistake; see [section 12](#12-if-the-build-fails). **The live
     site is unchanged when a build fails** — a broken build cannot take the
     site down.
3. Check the page on a phone as well as a laptop.

### Preview deployments

Pushing to any branch other than `main` gives you a private preview URL without
touching the live site. Useful for showing the practice a draft before it goes
public:

```bash
git checkout -b new-projects
git push -u origin new-projects
```

Cloudflare comments the preview URL on the branch.

---

## 9. How to roll back a bad deploy

Something went live that should not have. Two ways to fix it, fastest first.

### Option A — instant rollback in Cloudflare (seconds)

1. Cloudflare dashboard → Workers & Pages → the site → **Deployments**.
2. Find the last deployment that was good.
3. Click the **⋯** menu next to it → **Rollback to this deployment**.
4. Confirm.

The live site reverts immediately. **Note:** this does not change the files in
this folder — the next `git push` will deploy them again. Use option B to fix
the underlying cause.

### Option B — undo the change properly

Find the commit that caused the problem:

```bash
git log --oneline
```

Then reverse it (use the short code from the left-hand column):

```bash
git revert a1b2c3d
git push
```

This creates a new commit that undoes the bad one, and redeploys. History is
preserved, so nothing is lost.

### If you have not pushed yet

To throw away all uncommitted changes and return to the last commit:

```bash
git restore .
```

---

## 10. Where the accounts live

Fill this in and keep it current. **This table is the reason this document
exists** — the most common way a site like this becomes unmaintainable is that
the one person who knew where everything lived moves on.

| What | Provider | Account holder | Who has access | Notes |
|---|---|---|---|---|
| Domain `dtlm.com.my` | MYNIC (`.com.my` registry) | *[TO CONFIRM]* | | Registrant must be verified via MYNIC WHOIS — `.com.my` is not administered by global registrars |
| DNS | **MSC Hosting** (`ns101/ns102.mschosting.com`) | *[TO CONFIRM]* | | Confirmed by lookup, Aug 2026. May sit with a third-party web developer rather than the practice |
| Source code | GitHub | *[TO CONFIRM]* | | |
| Hosting / build | Cloudflare Pages | *[TO CONFIRM]* | | Free tier |
| Contact form | Web3Forms | *[TO CONFIRM]* | | Access key is in `src/consts.js` |
| Analytics | Cloudflare Web Analytics | *[TO CONFIRM]* | | Cookieless — no consent banner needed |

> **Renewal dates matter more than anything else here.** A lapsed domain takes
> the site off the internet. Put the renewal date in a shared calendar, not one
> person's inbox.

---

## 11. Pre-publication checklist

Run through this before setting `draft: false` on anything.

**Content**

- [ ] Project title, year and location are correct
- [ ] `slug` matches the old site's URL if the project existed before
- [ ] Description reads well and is free of typos
- [ ] Client name is either omitted or cleared for publication

**Images**

- [ ] Under 2500px on the longest edge and under 2MB
- [ ] **Alt text written** and it describes the building, not the project name
- [ ] **Photographer credited** — named, or `In-house`
- [ ] **Web usage rights confirmed** with the photographer, and
      `imageRightsConfirmed: true` set

**Accessibility**

- [ ] `npm run check:contrast` passes (only needed if colours changed)
- [ ] Page reached and operated using only the <kbd>Tab</kbd> and
      <kbd>Enter</kbd> keys, with a visible outline on every stop
- [ ] Headings run in order — no jumping from `##` to `####`

**Final**

- [ ] Previewed at phone width as well as desktop
- [ ] `npm run build` completes without errors
- [ ] Deployment shows **Success** in Cloudflare
- [ ] Checked on the live site after deploying

---

## 12. If the build fails

**A failed build cannot break the live site.** The previous version stays up.
Take your time.

The error message names the file and the problem. The common ones:

| Message contains | What it means | Fix |
|---|---|---|
| `heroImageAlt still contains a placeholder` | Alt text was left as `[CONFIRM ...]` | Write real alt text — [section 7](#7-how-to-write-good-alt-text) |
| `photographer still contains a placeholder` | Credit not filled in | Name the photographer, or write `In-house` |
| `imageRightsConfirmed must be true` | Rights not yet checked | Confirm the rights, then set it to `true` |
| `heroImageAlt repeats the project title` | Alt text is just the project name | Describe the building instead |
| `heroImageAlt must describe...` (too short) | Under 15 characters | Write a fuller description |
| `typology must be one of` | Misspelling, or a value not on the list | Use exactly: `residential`, `commercial`, `civic`, `institutional`, `interior` |
| `status must be one of` | Same | Use exactly: `built`, `under-construction`, `competition`, `unbuilt` |
| `slug must be lowercase letters...` | Capitals, spaces or underscores in the slug | Lowercase and hyphens only |
| `Could not find requested image` | Filename in the file does not match the file on disk | Check spelling and extension — `.jpg` and `.JPG` are different |

If the message is not on this list, copy the whole thing into an email to your
developer. It names the file and line.

---

## 13. For developers

### Stack

| | |
|---|---|
| Generator | [Astro](https://astro.build) 7, static output |
| Content | Markdown with frontmatter, validated by Zod content collections |
| Images | Astro's build-time pipeline → AVIF/WebP with responsive `srcset` |
| Fonts | Inter Variable, self-hosted via `@fontsource-variable` — no CDN call |
| Hosting | Cloudflare Pages |
| Forms | Web3Forms, plain HTML POST |
| Analytics | Cloudflare Web Analytics (cookieless) |

### Constraints — please read before changing anything

These come from the project brief and are deliberate, not accidental:

1. **The site must work with JavaScript disabled.** All content, all
   navigation, and the contact form must function. JavaScript is progressive
   enhancement only. `npm run check:a11y` verifies this by rendering every page
   with JS off and comparing content length against the JS-on render.
2. **Do not add React, Next.js, Gatsby or any SPA framework** for content
   rendering. Astro was chosen precisely because it ships zero JS by default.
3. **Never fetch content from an external API at runtime.** All content is read
   at build time. Runtime fetching produces a blank page without JS.
4. **Use `<details>`/`<summary>` for expandable content.** Style it; do not
   rebuild it in JavaScript. It is keyboard operable and correctly announced by
   screen readers for free.
5. **Target WCAG 2.2 Level AA.** Do not add a text colour without adding the
   pair to `scripts/check-contrast.mjs`.
6. **Performance budget:** under 1MB first load, LCP under 2.5s on 4G.

### Commands

```bash
npm run dev             # local preview at :4321, drafts visible
npm run build           # production build → dist/, drafts excluded
npm run preview         # serve the production build locally
npm run check           # TypeScript and Astro diagnostics
npm run check:contrast  # WCAG contrast check on the palette
npm run check:a11y      # axe + no-JS + page weight audit (needs a server running)
npm run verify          # contrast, then build, then a11y audit
```

`check:a11y` expects the built site to be served at `http://localhost:4321`.
In a sandbox without Playwright's own browser download, point it at an existing
Chromium:

```bash
CHROMIUM_PATH=/path/to/chrome npm run check:a11y
```

### Structure

```
src/
  consts.js              Site config — name, nav, contact, form endpoint, image base
  content.config.ts      Zod schemas. The publish gate lives here
  i18n/en.js             All UI strings. Copy to ms.js to add Bahasa Malaysia
  lib/content.ts         Collection queries and draft filtering
  layouts/               BaseLayout — landmarks, skip link, meta
  components/            SiteHeader, SiteFooter, ProjectCard, DraftNotice
  pages/                 One file per route
  content/projects/      One Markdown file per project
  content/team/          One Markdown file per person
  content/press/         One Markdown file per award / publication / talk
  assets/                Source images, processed at build time
public/
  _redirects             Cloudflare Pages redirect map
  robots.txt
scripts/
  check-contrast.mjs     WCAG contrast validator
  a11y-audit.mjs         axe + no-JS + performance budget audit
```

### The draft mechanism

`src/lib/content.ts` filters drafts using `import.meta.env.PROD`: drafts render
in `dev`, and are excluded from `build`. The Zod schema then permits
placeholders **only** while `draft: true`. Together these mean an unfinished
project can be previewed but cannot reach the live site.

Do not "simplify" either half. That pairing is the mechanism that makes the
alt-text and photographer requirements real rather than aspirational.

### Adding Bahasa Malaysia later

1. `cp src/i18n/en.js src/i18n/ms.js` and translate the values.
2. Add `'ms'` to `locales` in `astro.config.mjs`.
3. Add a language switcher to `SiteHeader.astro`.
4. Decide whether project content is translated per-locale (a `ms` field, or
   parallel files) — that is a content decision, not a technical one.

The UI strings are already fully externalised, so no template changes are
needed for step 1.

### Migrating images to a CDN

If total image weight approaches ~500MB, change `IMAGES.baseUrl` in
`src/consts.js`. Image paths are abstracted behind that single value
specifically so this is a one-file change.
