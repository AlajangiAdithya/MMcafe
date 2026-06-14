# SEO Strategy — Mastermind Brews

**Domain:** https://www.mastermindbrews.com
**Prepared:** 2026-06-14
**Mode:** Existing live site (optimization, not launch)
**Stack:** React 19 + Vite 8 SPA (client-side rendered), React Router 7, Supabase, Razorpay
**Geographic priority:** Pan-India (en-IN), with international as a later option

---

## 1. Business model & SEO priorities

Mastermind Brews is a **multi-revenue specialty-coffee brand** built on three commercial pillars, all targeted nationally:

| # | Pillar | Site area | Monetization | SEO intent |
|---|--------|-----------|--------------|------------|
| **A** | **Bean e-commerce** | `/store` | Sell single-origin Chikmagalur beans, shipped pan-India | Transactional + commercial-investigation |
| **B** | **Academy / learning platform** | `/workshop`, `/course/:id`, `/learn/:id` | Paid online barista courses | Informational → transactional funnel |
| **C** | **Consultancy / B2B** | `/consultancy` | Cafe setup, menu design, operations, barista training | Commercial / lead-gen |

Supporting assets: **Blog** (`/blog`) is the top-of-funnel content engine feeding all three pillars; **Baristas directory** (`/baristas`) is a secondary community/recruitment asset; the **physical Mulund cafe** exists but local footfall is *deprioritized* (we keep cheap local wins — GBP, LocalBusiness schema — but do not center the strategy on the local pack).

**Strategic stance:** Win **non-branded, pan-India informational + commercial queries** across coffee buying, barista learning, and cafe-building — three topic universes where Mastermind has genuine first-hand expertise (a real roastery, a real academy, a real cafe it operates). That lived expertise is the E-E-A-T moat; the job is to make it crawlable, structured, and citable.

---

## 2. Current-state assessment

### What's already strong ✅
- Single canonical domain with `www`, HTTPS implied, `en-IN` + `x-default` hreflang.
- Rich static `index.html`: description, keywords, robots directives, geo tags, OG + Twitter cards, theme-color.
- Homepage **JSON-LD `@graph`**: `Organization` + `WebSite` (with `SearchAction` sitelinks searchbox) + `CafeOrCoffeeShop`/`LocalBusiness` (address, geo, hours).
- `robots.txt` with sensible `Disallow` of private/transactional routes + `Sitemap` + `Host`.
- `sitemap.xml` present.
- Per-route `usePageMeta` hook updates title/description/canonical/OG/Twitter on navigation — good SPA hygiene.
- Sound build hygiene (code-splitting via manualChunks, lazy routes, Razorpay loaded on demand).

### Critical gaps & risks ❌ (priority order)

1. **Routes — verified OK (NOT a blocker).** *Correction of an earlier draft: a grep mis-rendered `/` as `\`, making the dynamic routes look malformed. The actual routes in `src/App.jsx` — `/blog/:slug`, `/course/:courseId`, `/course/:courseId/checkout`, `/learn/:courseId` — are correctly formed.* Separately, **Beans (`/store`), Academy (`/workshop`) and Blog (`/blog`) are intentionally hidden + `noindex` (owner's choice, "prep only")** and are excluded from the sitemap until launch. The real top blocker is rendering (next item).

2. **P0 — Client-side rendering + JS-injected meta.** All per-route meta/schema is set in `useEffect` (`usePageMeta`). Googlebot can render JS, but **social scrapers and most AI crawlers (ChatGPT, Perplexity, many GEO surfaces) do *not* execute JS** — they see only the static homepage `<head>` for *every* URL. Combined with the SPA, deep pages have weak/duplicate share previews and poor AI-citation readiness. **Fix: prerender (SSG) the indexable routes**, or migrate to an SSR/SSG framework (see Technical Foundation §5).

3. **P1 — No per-page structured data.** Schema lives only on the homepage. Product (beans), Course (academy), Article + author (blog), Service (consultancy), BreadcrumbList, and FAQPage are all missing — these are the rich-result types that win SERP real estate for the three pillars.

4. **P1 — Shallow, stale, static sitemap.** Only 15 top-level URLs; **no product, course, or blog-post URLs**; `lastmod` frozen at 2026-05-17. Needs build-time generation from the live catalog/CMS.

5. **P1 — No measurement baseline.** Google Search Console **not verified** (verification tag is commented out in `index.html`), no analytics/CrUX baseline. We are flying blind until this is in place.

6. **P2 — Core Web Vitals risk.** Heavy Framer Motion + Lenis smooth-scroll + many scroll-linked animations across pages create real **INP** and **CLS** exposure. Must be measured and budgeted.

7. **P2 — Local assets unclaimed.** Google Business Profile for the Mulund cafe is not claimed (cheap win even though local is deprioritized).

---

## 3. Keyword strategy (Pan-India, en-IN)

No live volume data was available (no DataForSEO/GSC at planning time); the lists below are **intent-mapped seed clusters** to validate against GSC + a volume tool in Phase 1. Difficulty is relative (national specialty-coffee SERPs are competitive — Blue Tokai, Third Wave, etc. dominate head terms; **our wedge is the long tail and the academy/consultancy verticals where competition is thinner**).

### Pillar A — Beans (commercial/transactional)
- Head (hard): `buy coffee beans online india`, `specialty coffee india`, `single origin coffee`
- Body (medium): `chikmagalur coffee beans`, `freshly roasted coffee beans online`, `coffee bean subscription india`, `best coffee beans for espresso india`, `arabica coffee beans india`
- Long tail (win first): `medium roast single origin beans for moka pot`, `chikmagalur arabica vs robusta`, `how much coffee does a [device] need`, `best beans for south indian filter coffee`

### Pillar B — Academy / learning (informational → transactional)
- Head: `online barista course india`, `barista training`
- Body: `how to become a barista in india`, `home barista course online`, `latte art classes online`, `coffee brewing course`, `barista certification india`
- Long tail: `how to make latte art at home for beginners`, `pour over coffee ratio guide`, `barista salary in india`, `equipment for a home espresso setup`

### Pillar C — Consultancy / B2B (commercial lead-gen)
- Head: `cafe consultant india`, `how to open a cafe in india`
- Body: `cafe setup cost in india`, `coffee shop business plan india`, `cafe menu design`, `restaurant coffee program`, `barista staffing for cafes`
- Long tail: `how much does it cost to open a coffee shop in mumbai`, `cafe SOP checklist`, `espresso machine for a new cafe india`

**Mapping rule:** transactional → pillar landing/PDP/course pages; informational → blog/guides that internally link *up* to the relevant pillar page (hub-and-spoke). See `SITE-STRUCTURE.md`.

---

## 4. E-E-A-T & GEO (AI search) plan

Specialty coffee + "how to open a cafe" + "become a barista" are **YMYL-adjacent, expertise-gated** topics. AI Overviews and LLMs reward demonstrable first-hand experience.

- **Experience:** publish content that only an operating roastery/cafe/academy could write — roast logs, cupping notes, real cafe build case studies, student outcomes. Use first-person, photos of the actual roastery/cafe.
- **Expertise/Author:** create real author bios (founder, head roaster, lead trainer) with credentials; attach `author` (Person schema) to every article and course. Link bios sitewide.
- **Authoritativeness:** earn mentions/links from Indian coffee media, F&B publications, supplier/partner sites; get listed in coffee roaster directories.
- **Trust:** keep policies (refund/shipping/privacy) crisp; show real reviews (with `Review`/`AggregateRating` schema where genuine), real NAP, real contact.
- **GEO/AI readiness:** prerender pages so non-JS AI crawlers see content; add an `/llms.txt`; write **answer-first** passages (lead with the direct answer in 2–3 sentences, then expand); add `FAQPage` schema to pillar + guide pages; keep factual, citable claims with units and specifics.

---

## 5. Technical foundation (summary — full steps in IMPLEMENTATION-ROADMAP.md)

- **Fix dynamic route paths** (`/blog/:slug`, `/course/:courseId`, `/learn/:courseId`). *(P0)*
- **Prerender indexable routes** to static HTML with correct per-page `<head>` + JSON-LD. Options, simplest → most robust:
  1. `vite-plugin-prerender` / `@prerenderer/rollup-plugin` or `react-snap` for the static + known dynamic routes.
  2. A prerender/SSR proxy (e.g. Prerender.io) at the host layer.
  3. **Strategic:** migrate to **Next.js** (App Router) for true SSR/SSG/ISR — best long-term fit for a 3-pillar content+commerce site and AI search. Treat as a Phase 3 evaluation.
- **Per-page schema** components: `Product`, `Course`, `Article`+`Person`, `Service`, `BreadcrumbList`, `FAQPage`.
- **Dynamic sitemap** generated at build from catalog/CMS, with fresh `lastmod`; split if it grows (products / courses / blog / core).
- **Verify GSC** (uncomment + paste verification), submit sitemap, enable URL inspection; consider **Bing Webmaster + IndexNow**.
- **Measure CWV** (PageSpeed/CrUX), set budgets, gate animations behind `prefers-reduced-motion`, lazy-load below-fold media, ship responsive `WebP/AVIF`.

---

## 6. KPI targets

> ⚠️ **Baselines unknown — GSC is not yet verified.** Step 1 of Phase 1 is to capture real baselines; the values below are directional targets to refine once baseline data exists. Treat "Baseline" as *to be captured in Week 1*.

| Metric | Baseline | 3 months | 6 months | 12 months |
|--------|----------|----------|----------|-----------|
| Organic clicks / mo (GSC) | _capture wk1_ | +40–70% | 2–3× | 4–6× |
| Indexed pages (valid) | _capture wk1_ (likely top-level only) | +blog/products/courses indexed | full catalog indexed | full catalog + 30–50 articles |
| Non-branded keywords in top 10 | _capture wk1_ | 15–30 long-tail | 40–80 | 120–200 |
| Rich results (Product/Course/Article/FAQ) | ~0 | Product + Course live | + Article + FAQ + Breadcrumb | broad coverage, monitored |
| Core Web Vitals (field, mobile) | _capture wk1_ | LCP < 2.5s on key templates | INP < 200ms, CLS < 0.1 | all "Good" across templates |
| AI-citation readiness | low (CSR, no prerender) | prerender live + llms.txt | answer-first + FAQ on pillars | tracked brand mentions in AI answers |

---

## 7. Success criteria & risks

**Success per phase** = (1) the technical blockers for that phase are closed and verified in GSC/Rich Results Test, (2) the planned content shipped, (3) the KPI trend is positive vs the Week-1 baseline.

**Top risks & mitigations**
- *CSR keeps deep pages invisible to AI/social* → prerender is non-negotiable; treat as P0 alongside the route fix.
- *Head terms dominated by funded roasters* → win the long tail + academy/consultancy verticals first; don't burn effort on `buy coffee online` head term early.
- *Animation-driven INP regressions* → CWV budget + `prefers-reduced-motion`, measured every deploy (see `seo-drift`).
- *Thin programmatic pages* (if product/course pages are templated) → enforce unique, substantive content per page; see `seo-programmatic` guidance before scaling.

**Companion docs:** `COMPETITOR-ANALYSIS.md`, `SITE-STRUCTURE.md`, `CONTENT-CALENDAR.md`, `IMPLEMENTATION-ROADMAP.md`.
