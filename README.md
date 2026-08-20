# DTLM Architect — website

The practice website for DTLM Architect, Kuala Lumpur. It is a **static site**:
there is no database and no server to maintain. Content lives in text files in
this folder, and the site is rebuilt automatically whenever those files change.

**Routine content edits — Selected Works, Awards & Recognition, News, Museums,
Books — don't need any of the below.** Log
into **`/admin/`** on the live site with your GitHub account and use the form.
See [section 3](#3-how-to-add-a-new-project) and
[section 5](#5-how-to-add-an-award-or-press-mention) for what that covers, and
[section 10](#10-where-the-accounts-live) for how the login is set up.

This document is written for a tech-savvy person who is not a developer, and
covers everything the CMS doesn't: the technical fallback for editing files by
hand, adding a team member, and how the site works underneath. If you can edit
a text file and use a web browser, you can maintain this site either way.

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

### The easy way — the CMS

1. Go to `/admin/` on the live site and sign in with GitHub.
2. Open **Selected Works** → **New Project**.
3. Fill in the form and drag your image onto the **Hero image** field — see
   [section 6](#6-preparing-images) for what makes a good one, and
   [section 7](#7-how-to-write-good-alt-text) for the alt text field.
4. To show more than one photo, add them under **Additional gallery
   images** — visitors can swipe or scroll through hero + gallery together
   as one sequence in the project's popup. Drag entries by their handle to
   reorder them; that's the order they appear in. Each one needs its own
   alt text, held to the same standard as the hero image.
5. Leave **Draft** turned on while you work. It only shows up on the live
   site once you turn it off.
6. Click **Save**. That's it — no terminal, no Git. The CMS commits the file
   straight to the site's source, which redeploys automatically within a
   couple of minutes (see [section 8](#8-how-deployment-works)).

> **The site will refuse to publish an incomplete project even through the
> CMS.** If you turn Draft off while alt text is unwritten, the photographer
> is unconfirmed, or image rights aren't ticked, the deploy fails rather than
> publishing something wrong. Check the practice's GitHub repository's
> **Actions** tab if a save doesn't seem to have taken effect — see
> [section 12](#12-if-the-build-fails).

The **Technical ID** field the CMS shows is just an internal label the page
uses to identify the project's popup — it isn't a real web address the way it
used to be, so don't worry about getting it perfect.

### The manual way — editing files directly

Useful if the CMS is unavailable, or you're comfortable with a text editor and
Git and would rather work that way. Produces the exact same file the CMS
would.

**Step 1 — prepare the image.** Read [section 6](#6-preparing-images) first.
Save the finished image into `src/assets/projects/`, named after the project
in lowercase with hyphens: `verandah-house.jpg`

**Step 2 — copy the template.** In `src/content/projects/` you will find
`_TEMPLATE.md.txt`. Copy it, and rename the copy to match your project —
**ending in `.md`, not `.md.txt`**: `src/content/projects/verandah-house.md`

**Step 3 — fill it in.** Everything between the two `---` lines at the top is
the project's information. Everything below is the project's written
description. The template explains each field. The important ones:

| Field | Notes |
|---|---|
| `slug` | An internal id used for the project's popup on the page — no longer a real web address (the site is a single scrollable page now). Lowercase, hyphens, doesn't need to be exact. |
| `year`, `location`, `status`, `typology` | All required. `status` and `typology` must be one of the listed values, spelled exactly. |
| `heroImageAlt` | Required. See [section 7](#7-how-to-write-good-alt-text). |
| `gallery` | Optional. Extra photos shown after the hero image in a swipeable gallery. List order is display order. Each entry's `alt` follows the exact same rules as `heroImageAlt`. |
| `photographer` | Required. The photographer's name, or `In-house`. |
| `imageRightsConfirmed` | Must be `true` before the project can go live. Only set this once you have actually checked. |
| `featured` | `true` puts it on the homepage's Selected Works section — currently the only place projects appear. |
| `order` | Lower numbers appear first. |
| `draft` | `true` while you are still working. Set to `false` to publish. |

**Step 4 — preview it.** With `npm run dev` running, visit
<http://localhost:4321/> — your project should be in the Selected Works
section (if `featured: true`).

**Step 5 — publish it.** Work through the
[pre-publication checklist](#11-pre-publication-checklist), then change
`draft: true` to `draft: false`, save, and follow
[section 8](#8-how-deployment-works).

> **The site will refuse to build if a project is incomplete.** If you set
> `draft: false` while alt text is still unwritten, the photographer is
> unconfirmed, or image rights are not ticked, the build stops with a message
> naming the problem. This is on purpose — see [section 12](#12-if-the-build-fails).

---

## 4. How to add a team member

**Not in the CMS** — this collection is edited by hand only, the same manual
pattern as section 3's fallback method. Also worth knowing: the homepage
currently only ever shows the principal's headshot and name (pulled onto the
Hero section by matching `SITE.principal` in `src/consts.js`) — there's no
standalone team page anymore, so adding someone here doesn't put them
anywhere on the live site yet. That's a placeholder for future work, not a
bug.

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

This one collection of files backs **four different sections** on the
homepage: Awards & Recognition, News, Museums, and Books. Which section an
item appears in is decided entirely by its `kind` field.

### The easy way — the CMS

Go to `/admin/` and sign in. In the sidebar you'll see the four sections
listed separately — **Awards & Recognition**, **News — Articles**,
**News — Talks**, **Museums**, **Books**. Open whichever matches, click
**New**, and fill in the form. The CMS sets the right `kind` for you
automatically — you'll never see that field.

Museums and Books currently have no entries at all (they show "Coming soon."
on the live site) — adding the first one there works exactly the same way as
any other.

### The manual way — editing files directly

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
| `kind` | One of `award`, `publication`, `speaking`, `museum`, `book`. Decides which homepage section it appears in — see the mapping below. |
| `source` | The publication, awarding body, or museum. |
| `date` | Format `YYYY-MM-DD`. Optional — leave it out if you do not know it. |
| `dateNote` | Use instead of `date` when only an issue is known, e.g. `"Vol.36, Issue 1, 2024"`. |
| `url` | Link to the original coverage. Optional but strongly preferred. |
| `featured` | `true` also shows it on the homepage. |

`kind` → homepage section:

| `kind` | Section |
|---|---|
| `award` | Awards & Recognition |
| `publication` | News |
| `speaking` | News, under a "Speaking engagements" sub-heading |
| `museum` | Museums |
| `book` | Books |

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

Every change — whether saved through the CMS or pushed by hand — lands on
this repository's `main` branch on GitHub. From there, deployment is
automatic. You never upload files by hand either way.

> **Current status (keep this updated):** the intended production host is
> **Cloudflare Pages**, connected to `main`, serving `dtlm.com.my` — that is
> what the rest of this section describes. As of this writing that connection
> has **not been made yet**; the only deployment actually building from
> `main` today is an internal-only **GitHub Pages** preview
> (`.github/workflows/gh-pages.yml`), used for showing people how the site
> looks before it's really live. Update this note once Cloudflare Pages is
> connected — see [section 10](#10-where-the-accounts-live).

### To publish a change by hand (skip this if you used the CMS)

```bash
git add .
git commit -m "Add Verandah House project"
git push
```

That is it. Whichever deployment is connected notices the push, rebuilds the
site, and publishes it — usually within two minutes.

### How to confirm it worked

**Once Cloudflare Pages is connected:**

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

**Today, with only the GitHub Pages preview connected:** go to the
repository's **Actions** tab on GitHub. The newest "Deploy preview to GitHub
Pages" run should show a green check — same idea, same failure behavior, just
a different dashboard. It publishes to the practice's `github.io` preview
URL, not `dtlm.com.my`.

### Preview deployments (once Cloudflare Pages is connected)

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

### Option A — instant rollback in Cloudflare (seconds, once connected)

1. Cloudflare dashboard → Workers & Pages → the site → **Deployments**.
2. Find the last deployment that was good.
3. Click the **⋯** menu next to it → **Rollback to this deployment**.
4. Confirm.

The live site reverts immediately. **Note:** this does not change the files in
this folder — the next `git push` will deploy them again. Use option B to fix
the underlying cause. (Until Cloudflare Pages is connected — see
[section 8](#8-how-deployment-works) — there is no equivalent instant
rollback; go straight to option B.)

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
| Domain `dtlm.com.my` | MYNIC (`.com.my` registry) | *[TO CONFIRM]* | | Registrant must be verified via MYNIC WHOIS — `.com.my` is not administered by global registrars. Currently still points at the old site |
| DNS | **MSC Hosting** (`ns101/ns102.mschosting.com`) | *[TO CONFIRM]* | | Confirmed by lookup, Aug 2026. May sit with a third-party web developer rather than the practice |
| Source code | GitHub — `github.com/melvyn9/dtlm-website` | melvyn9 | Anyone added as a **Write** collaborator on the repo | Public repository |
| Content editing (CMS) | Sveltia CMS at `/admin/`, no separate account — signs in with your GitHub login | Same as source code access | Same as source code access | Anyone who can edit content must be a repo collaborator with **Write** access — logging in alone isn't enough |
| CMS login backend | GitHub OAuth App (`GitHub → Settings → Developer settings → OAuth Apps`) | melvyn9 | | Lets the CMS ask GitHub to verify who's logging in. Holds a Client ID and Client Secret |
| CMS login backend (hosting) | Cloudflare Worker, `sveltia-cms-auth`, at `sveltia-cms-auth.melvyn9.workers.dev` | melvyn9 | | Deployed from `github.com/sveltia/sveltia-cms-auth` (not part of this repo). Holds the OAuth App's Client ID/Secret as Worker secrets, and an `ALLOWED_DOMAINS` list restricting which sites may use it |
| Hosting / build (preview) | **GitHub Pages** — `melvyn9.github.io/dtlm-website/` | melvyn9 | | Internal preview only, not the real domain. Auto-deploys on every push to `main` via `.github/workflows/gh-pages.yml` |
| Hosting / build (production) | Cloudflare Pages | *[TO CONFIRM]* | | **Not yet connected** — see [section 8](#8-how-deployment-works). Intended to serve `dtlm.com.my` from this repo's `main` branch. Free tier |
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

**A failed build cannot break the live site.** The previous version stays up
— whether the change came from the CMS or a manual push. Take your time.

**Where to look:** if a CMS save doesn't seem to have taken effect after a
couple of minutes, check the repository's **Actions** tab on GitHub (or the
Cloudflare Pages **Deployments** tab, once that's connected — see
[section 8](#8-how-deployment-works)) for a failed run, and open it to read
the error.

The error message names the file and the problem. The common ones:

| Message contains | What it means | Fix |
|---|---|---|
| `heroImageAlt still contains a placeholder` | Alt text was left as `[CONFIRM ...]` | Write real alt text — [section 7](#7-how-to-write-good-alt-text) |
| `photographer still contains a placeholder` | Credit not filled in | Name the photographer, or write `In-house` |
| `imageRightsConfirmed must be true` | Rights not yet checked | Confirm the rights, then set it to `true` |
| `heroImageAlt repeats the project title` | Alt text is just the project name | Describe the building instead |
| `heroImageAlt must describe...` (too short) | Under 15 characters | Write a fuller description |
| `gallery image alt text...` | Same alt-text rules as above, but on one of the additional gallery images rather than the hero image | Same fixes — the message names which check failed |
| `typology must be one of` | Misspelling, or a value not on the list | Use exactly: `residential`, `commercial`, `civic`, `institutional`, `interior` |
| `status must be one of` | Same | Use exactly: `built`, `under-construction`, `competition`, `unbuilt` |
| `slug must be lowercase letters...` | Capitals, spaces or underscores in the slug | Lowercase and hyphens only |
| `Could not find requested image` | Filename in the file does not match the file on disk | Check spelling and extension — `.jpg` and `.JPG` are different |
| `Expected type "number", received "object"` | A number field (e.g. `area`) was left blank through the CMS, which saves that as `null` rather than leaving it out | Already handled for `area` in the schema (`.nullable()`). If it happens on a different number field, ask your developer to add `.nullable()` there too |

If the message is not on this list, copy the whole thing into an email to your
developer. It names the file and line.

---

## 13. For developers

### How the site fits together

The site is one build pipeline with two front doors — a visitor's browser,
and the CMS at `/admin/` — that both end up producing the same thing: plain
Markdown files that [Astro](https://astro.build) turns into static HTML.
There is no runtime backend and no database anywhere in this picture.

```
                                 ┌─────────────────────────┐
  Editor (browser)               │  GitHub — melvyn9/dtlm-website │
  ───────────────                │  main branch, source of truth  │
  /admin/ (Sveltia CMS)  ──login──▶│  Markdown + images in src/     │
       │        via a small        └────────────┬────────────────┘
       │   Cloudflare Worker                     │ push triggers
       │  (OAuth token exchange,                 ▼
       │   sveltia-cms-auth,           ┌───────────────────────┐
       │   deployed separately)        │  Astro build           │
       └──── commits land on ─────────▶│  content.config.ts     │
             main via GitHub's API     │  (Zod schema — the     │
                                        │   real content gate)   │
                                        └───────────┬────────────┘
                                                     ▼
                                        ┌───────────────────────┐
                                        │  Static HTML/CSS files │
                                        │  deployed to:          │
                                        │  • GitHub Pages        │
                                        │    (internal preview)  │
                                        │  • Cloudflare Pages     │
                                        │    (production —       │
                                        │    not yet connected)  │
                                        └───────────┬────────────┘
                                                     ▼
                                              Site visitors
```

- **[Astro](https://astro.build) 7** is the frontend framework — it reads the
  Markdown content at build time and generates plain HTML/CSS pages. Nothing
  runs on a server per-visit; every page is a pre-built file. This is also
  what makes the "works with JavaScript disabled" requirement (below)
  achievable rather than aspirational — there's no client-side rendering to
  fall back from.
- **Content collections + Zod** (`src/content.config.ts`) are the schema
  every project/press/team entry is checked against at build time. This is
  the one real gate in the whole system — see
  [section 12](#12-if-the-build-fails) and
  [the draft mechanism](#the-draft-mechanism) below.
- **[Sveltia CMS](https://sveltiacms.app)** is the form-based editing screen
  at `/admin/` (`public/admin/index.html` + `config.yml`). It's a
  client-side app loaded from a CDN — no build step, no server of its own —
  that reads and writes the *exact same* Markdown files a developer would
  edit by hand, through GitHub's API. It does not weaken the Zod schema; see
  the comments at the top of `public/admin/config.yml` for exactly what it
  does and doesn't mirror.
- **GitHub** is both the source-code host and the CMS's storage backend —
  every CMS save is a real Git commit to `main`, visible in normal `git log`
  history alongside hand-written commits.
- **A Cloudflare Worker** (deployed separately, from
  [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth),
  not part of this repository) handles the "Sign in with GitHub" OAuth
  handshake — the one piece of infrastructure that exists purely so the CMS
  can prove who's logging in. See [section 10](#10-where-the-accounts-live).
- **Hosting**: static files are deployed to GitHub Pages today (internal
  preview only) and are intended for Cloudflare Pages in production — see
  [section 8](#8-how-deployment-works) for current status.
- **Web3Forms** handles the contact form as a plain HTML POST — no JavaScript
  fetch call, no form backend of our own.
- **Cloudflare Web Analytics** is cookieless, injected at the edge, so no
  consent banner is needed.

| | |
|---|---|
| Frontend / generator | [Astro](https://astro.build) 7, static output |
| Content | Markdown with frontmatter, validated by Zod content collections |
| Content editing | [Sveltia CMS](https://sveltiacms.app) at `/admin/`, git-backed |
| CMS login | GitHub OAuth via a Cloudflare Worker (`sveltia-cms-auth`) |
| Images | Astro's build-time pipeline → AVIF/WebP with responsive `srcset` |
| Fonts | Inter Variable, self-hosted via `@fontsource-variable` — no CDN call |
| Hosting (preview) | GitHub Pages |
| Hosting (production) | Cloudflare Pages — not yet connected |
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

### The mobile navigation

The full-screen mobile menu is built almost entirely without JavaScript. It is
worth understanding before changing it, because the structure is not the
obvious one — and because it now carries the site's only JavaScript, added
deliberately and narrowly (see the end of this section).

A `<details>` element in the header holds **only the toggle button**. The
navigation links are a **sibling** `<nav id="primary-nav">`, and `:has()`
drives the overlay:

```css
.site-header:has(#site-nav[open]) .primary-nav { position: fixed; inset: 0; … }
```

The obvious structure — links nested inside the `<details>` — cannot be made to
display inline on desktop. Browsers hide a closed `<details>`'s content using
`content-visibility: hidden` on an internal shadow-DOM slot that author CSS
cannot reach. Chrome 131+ exposes `::details-content` for this, but Safari and
Firefox do not, so depending on it would leave desktop navigation invisible in
those browsers. This was verified in a real browser, not assumed: the nested
version produced links with correct computed styles, zero layout height, and no
reachable navigation at any desktop width.

Since the site became a single scrollable page, every NAV link is now a
same-page `/#id` anchor rather than a separate route. That introduced two
things worth knowing if you touch this:

- **The header is sticky on mobile at all times**, not just while the overlay
  is open — `.site-header { position: sticky; top: 0; }` under the mobile
  media query, unconditionally. Originally added only while the overlay was
  open (to stop a same-page anchor scroll carrying the close button off
  screen with no way back), it's now a general "the menu toggle is always
  reachable" feature. Not gated behind the `:has()` support check, since
  plain `position: sticky` doesn't need it.
- **`<main>` and `<footer>` are `visibility: hidden` while the overlay is
  open — not `display: none`.** That still satisfies focus containment
  (WCAG 2.2 SC 2.4.11), but *also* keeps their layout box intact, which
  matters because a same-page anchor scroll needs somewhere real to land
  even while the overlay covers it visually. `display: none` was tried
  first and broke exactly this — the target section had nowhere to scroll
  to, and the scroll silently failed with no way to recover once the
  overlay closed.
- **A `details` selector in a test or stylesheet now matches the nav toggle
  too**, and the header precedes `<main>` in the document. Scope to
  `main details` (or, for project detail, `main [popover]` — see below) when
  you mean something other than the nav toggle.

**The one piece of JavaScript in the whole site** lives here too: a small
inline `<script>` in `SiteHeader.astro` that closes the mobile overlay when a
nav link is clicked. Without it the link still works — the overlay just
needs a second tap on the toggle to close, which was the entire behavior
before this was added. A pure-CSS alternative (`:target`-based auto-close)
was tried and rejected: `:target` is a persistent match on the current URL
fragment, not a one-time "just navigated" event, so it would have also
permanently blocked the menu from ever reopening after the first link click.
See the comment block at the top of `SiteHeader.astro` for the full
reasoning.

**Project detail is not `<details>` anymore either.** It moved from a
separate page to a same-page popover (`ProjectPopover.astro`) using the
native HTML **Popover API** (`popover="auto"` + `<button popovertarget>`) —
also zero JavaScript, also declarative, and it satisfies "doesn't navigate to
a different URL" for free since there's no URL change at all, not even a
`#fragment`.

`npm run check:nav` exercises the overlay at 13 viewport widths with
JavaScript disabled — the one enhancement script above simply doesn't run in
that mode, and the audit confirms the menu is still fully usable without it.
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
npm run check:nav       # mobile/desktop nav at 13 widths, JS disabled
npm run verify          # contrast → build → a11y audit → nav audit
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
  lib/url.ts             withBase() — GitHub Pages preview subpath helper
  layouts/               BaseLayout — landmarks, skip link, meta
  components/            SiteHeader (incl. the one enhancement script),
                          SiteFooter, ProjectCard, ProjectPopover,
                          PressSection, PressList, DraftNotice
  pages/                 index.astro is almost the whole site now (a single
                          scrollable page); a few standalone pages remain —
                          accessibility, privacy, contact/thank-you, 404
  content/projects/      One Markdown file per project — "Selected Works"
  content/team/          One Markdown file per person (Hero headshot only —
                          not surfaced elsewhere yet, not in the CMS)
  content/press/         One Markdown file per award/publication/talk/
                          museum/book — the `kind` field decides which
                          homepage section it appears in
  assets/                Source images, processed at build time
public/
  admin/                 Sveltia CMS — index.html + config.yml
  _redirects             Cloudflare Pages redirect map (301s from every
                          retired page path to the relevant homepage anchor)
  robots.txt             Disallows /admin/ from search indexing
scripts/
  check-contrast.mjs     WCAG contrast validator
  a11y-audit.mjs         axe + no-JS + performance budget audit
  nav-responsive-audit.mjs  Mobile/desktop nav across 13 widths, JS disabled
```

Note: the CMS's GitHub OAuth backend (`sveltia-cms-auth`) is **not** part of
this repository — it's deployed separately from
[`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth).
See [section 10](#10-where-the-accounts-live).

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
