# DTLM Architect — Phase 0 Audit

**Date:** 14 August 2026
**Status:** Partial — crawl obstructed, see §6
**Governing document:** DRTAN LM Architect Website Project Brief (August 2026)

---

## 1. Decisions confirmed this session

| Item | Decision | Brief ref |
|---|---|---|
| Phase 0 scope | Audit and inventory only; no scaffolding until reviewed | §9.1 |
| News / awards / press | **Option 2** — curated awards & press page | §5 |
| Firm display name | **DTLM Architect** | §10 |
| Language | English now; structure so Bahasa Malaysia can be added without a rewrite | §10 |
| Project count at launch | **Curate 8–12** from the existing archive | §10 |
| Build workflow | Cloud container builds and tests; source files synced to `dtlm-website` | — |

**Flag on firm name.** The existing site brands itself *DRTANLM ARCHITECT* in page titles and *DRTAN LM Architect* in body copy throughout. The chosen display form, *DTLM Architect*, appears nowhere on the current site. This is a legitimate rebrand decision and I am proceeding with it, but §10 asks for the **exact legal and display form** — worth confirming with the practice that the registered entity name permits it, since it will appear in the footer, page titles, structured data and the accessibility statement.

---

## 2. Existing site — technical profile

- **Platform:** WordPress
- **Host IP:** `110.4.45.17` (Kuala Lumpur, AS46015)
- **Nameservers:** `ns101.mschosting.com`, `ns102.mschosting.com`

### URL structure (this is what the redirect map must preserve)

```
/                          Home
/works/                    Project index
/portfolio/[slug]/         Project detail
/team/                     Team
/project-type/[typology]/  Typology taxonomy
/category/updates/         News archive (paginated, 2+ pages)
```

### Conflict with brief §4 — decision needed

The brief specifies `/projects/` and `/projects/[slug]/`. The live site uses `/works/` and `/portfolio/[slug]/`. Adopting §4 as written means **every project URL on the site changes**, and all accumulated ranking on those URLs depends entirely on the `_redirects` file being correct and complete.

Two options, both defensible:

1. **Follow §4, redirect everything.** Cleaner information architecture. Requires a complete and accurate slug inventory — which I do not yet have (see §6).
2. **Keep `/works/` and `/portfolio/`.** Zero redirect risk on the highest-value URLs. Costs nothing but tidiness.

This is a deviation from the brief either way, so I am not choosing it unilaterally.

---

## 3. Content findings

### Projects: 34 exist, not 5–12

The brief was scoped against 5 projects with 8–12 suggested. The live `/works/` index lists **34**. Full list captured in `url-inventory.csv`.

Notable for shortlisting: Clay Roof House (ARCASIA 2025 Honorary Mention), Kemaris House (Tatler Asia, ArchDaily), House No. 36 (Architecture Malaysia), URMU and +n by Ur-Mu (The Star), Glad Tidings Offices, S11 House, PJKita Community Centre.

Range spans residential, commercial, civic, institutional and interior, plus international work in Vietnam, Myanmar and South Korea — so the §6 `typology` enum is adequate as written.

### The existing pages do not carry the §6 metadata

This is the most consequential finding for planning. I pulled a full project detail page (Clay Roof House) as a representative sample. It contains a title, a location reference and good descriptive body copy — and **none** of: `year`, `client`, `status`, `area`, `photographer`, `awards`, `publications`, `team`, `consultants`.

Clay Roof House is the firm's ARCASIA 2025 honoree and **its own page does not mention the award**.

Consequences:

- The §6 content model cannot be populated by scraping. Roughly half of every project's required frontmatter has to be supplied by the practice.
- `photographer` is a **required** field per §6 and is not recorded anywhere on the existing site. §6 correctly frames this as legal exposure rather than a nicety. For 8–12 projects that is 8–12 rights confirmations the firm must make before publication — this should start now, not at launch, because it has a lead time I do not control.
- I recommend I produce a **content collection sheet** — one row per shortlisted project, columns matching the §6 schema — for the practice to fill in. That converts an open-ended request into a finite task.

### Press archive: at least 12 items, 2+ pages

Captured so far: PAM Gold Medal 2025, ARCASIA Awards 2025, Tatler Asia (Kemaris House), ArchDaily (Kemaris House), The Edge/Options (Aug 2024), BFM Property Show (Jul 2024), Architizer, Architecture Malaysia Vol.36 (House No. 36), The Star (Ur-Mu), Next Asia II, and two speaking engagements.

This comfortably justifies the curated page decision. Pagination indicates more items on page 2+ that I have not yet enumerated.

---

## 4. Domain & DNS (§9.4)

| Check | Result |
|---|---|
| A record | `110.4.45.17` (both apex and `www`) |
| Nameservers | `ns101.mschosting.com` / `ns102.mschosting.com` |
| DNS controller | **MSC Hosting** — a Malaysian host, not a global registrar and not Cloudflare |
| MYNIC registrant | **Not yet verified** — see below |

**What this means.** DNS is managed at the hosting provider. The site and its DNS are therefore very likely under the same account, and whoever built or maintains the current WordPress site probably holds those credentials. §9.4 warns that registrant and DNS controller are often different parties; here the risk is more specific — the cutover requires access to an MSC Hosting control panel that may sit with a third-party web developer rather than with the practice.

**Action needed from you:** confirm who holds the MSC Hosting account, and separately the MYNIC registrant record. I could not complete the MYNIC WHOIS lookup — outbound port 43 is blocked from this environment, and MYNIC's web lookup requires interactive access. This is a lookup you or the practice can do directly at `mynic.my`.

Getting this resolved early matters: it is the single item most likely to stall a launch date, and it has no technical workaround.

---

## 5. Accessibility baseline

Not yet assessed — the existing site's conformance is not directly relevant, since it is being replaced. Automated and manual passes per §7 will run against the new templates in the cloud container, where Chromium and Playwright are available.

---

## 6. Obstruction — incomplete crawl

The site's `robots.txt` is returning **HTTP 508 (Loop Detected)** intermittently. My fetching tool checks `robots.txt` before every request and treats the failure as a disallow, so most requests are being refused. Roughly a third succeeded; the rest failed regardless of retry.

**Captured:** home, `/works/` (all 34 project names), `/category/updates/` (12 items), one full project detail page, DNS records.

**Not captured:**

- Exact `/portfolio/` slugs for 30 of 34 projects — **this is the blocker for a complete redirect map**
- `/team/` contents
- Contact details: address, phone, email
- News post URLs and page 2+ of the archive
- Full `/project-type/` taxonomy terms
- Image inventory: count, dimensions, file sizes, visible credits

I attempted the WordPress REST API (`/wp-json/wp/v2/`), which would have returned the complete inventory in two or three requests. It is blocked by the same `robots.txt` failure.

I have stopped retrying rather than continue hammering a failing endpoint, and I am not presenting this inventory as complete.

---

## 7. Recommended next step

Three ways forward, in my order of preference:

1. **Drive the crawl through your own browser.** The site is yours; a browser session reads it normally and is unaffected by the `robots.txt` fetch failure. This would complete the inventory properly, including the REST API route.
2. **Export from WordPress directly.** If you or the practice have admin access, Tools → Export produces an XML file with every URL, slug, title, date and body. Attach it here and the inventory becomes complete and authoritative in one step — better than any crawl.
3. **Proceed on the partial inventory.** Viable only if we keep `/works/` and `/portfolio/` (§2 option 2), because then the project URLs never change and the missing slugs stop being load-bearing.

Option 2 is the strongest and the least work for everyone. Option 3 is the one that lets building start immediately.

---

## 8. Open items still unresolved

| §10 item | Status |
|---|---|
| Firm name | Decided (*DTLM Architect*) — legal form to confirm |
| Project count | Decided (curate 8–12) — shortlist pending full audit |
| News/press decision | Decided (curated page) |
| Brand assets — logo SVG, colours, typeface | **Outstanding.** Needed before Phase 1 visual work. Note §10's warning: desktop font licences do not cover web embedding |
| Image rights & credit lines | **Outstanding and on the critical path** — see §3 |
| Language | Decided (English, BM-ready) |
| DNS control | Partially answered — MSC Hosting; account holder unknown |
| Privacy notice / PDPA | Not started; in scope per §12 |
