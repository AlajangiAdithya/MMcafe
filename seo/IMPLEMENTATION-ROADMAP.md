# Implementation Roadmap — Mastermind Brews

**Prepared:** 2026-06-14
**Owner stack:** React 19 + Vite 8 SPA · React Router 7 · Supabase · Razorpay
**Principle:** fix what blocks indexation *before* producing content. Phases overlap; content (per `CONTENT-CALENDAR.md`) starts in Phase 1 in parallel with engineering.

Legend: **[ENG]** code change · **[SEO]** off-page/config · **[CONTENT]** writing.

---

## Phase 1 — Foundation & unblock (Weeks 1–4)  ⛏️ highest leverage

**Goal: make deep pages reachable, indexable, and measurable.**

1. **[ENG · DONE] Routes verified + hidden sections set to `noindex`.**
   Routes in `src/App.jsx` were verified correct (`/blog/:slug`, `/course/:courseId`, `/course/:courseId/checkout`, `/learn/:courseId`) — the earlier "broken routes" flag was a grep artifact, not real. Per owner's "keep hidden / prep only" decision, added a `noindex` flag to `usePageMeta` and applied it to Store, Academy(Workshop), Blog, CourseDetail, BlogPost; removed `/store`, `/workshop`, `/blog` (and auth pages) from `sitemap.xml`. Re-index them when launched.

2. **[ENG · P0] Prerender indexable routes to static HTML.**
   Start simple: add `react-snap` or `@prerenderer/rollup-plugin`/`vite-plugin-prerender` to the build to emit static HTML (with correct `<head>` + JSON-LD) for: `/`, `/store`, `/workshop`, `/consultancy`, `/about`, `/blog`, `/baristas`, `/contact`, policies, **and** known dynamic routes (products, courses, posts pulled from Supabase at build). Confirm `curl`'d HTML (JS disabled) contains the page's title, description, content, and schema. *(If build-time data pull is hard now, ship static routes first, then dynamic.)*

3. **[SEO · P0] Verify Google Search Console + Bing.**
   Uncomment and paste the verification tag in `index.html` (line ~62). Submit `sitemap.xml`. **Capture Week-1 baselines** (clicks, impressions, indexed pages, positions) → this fills the "Baseline" column in `SEO-STRATEGY.md` §6. Add Bing Webmaster Tools; enable **IndexNow**.

4. **[ENG · P1] Dynamic sitemap.**
   Generate `sitemap.xml` at build from the live catalog/CMS (products, courses, posts) with real `lastmod`; split into core/products/courses/blog if it grows. Drop the stale static file. Resubmit.

5. **[ENG · P1] Per-page `<head>` audit.** Confirm `usePageMeta` sets unique title/description/canonical on every indexable route; ensure prerender bakes these into static HTML (not only client-side).

6. **[SEO] Analytics + CWV baseline.** GA4 organic segment; run PageSpeed/CrUX on Home, Store, a PDP, a course page, a blog post → record field LCP/INP/CLS.

7. **[CONTENT] Start Month-1 posts** (see calendar) — even pre-prerender, write/queue them.

**Phase 1 done when:** dynamic routes resolve, prerendered HTML contains content+schema for key templates, GSC verified with baseline captured, dynamic sitemap submitted.

---

## Phase 2 — Structured data & on-page (Weeks 5–12)

**Goal: win rich results and tighten on-page across all three pillars.**

1. **[ENG] `<JsonLd>` component, injected per template** (prerendered):
   - Bean PDP → `Product`+`Offer` (INR price, availability) + `BreadcrumbList`
   - Course → `Course`+`Offer`+`Provider` + `BreadcrumbList`
   - Blog → `Article`/`BlogPosting`+`author(Person)`+dates+image + `BreadcrumbList` (+`FAQPage` where relevant)
   - Consultancy → `Service`(areaServed: India) + `FAQPage` + `BreadcrumbList`
   - About → `AboutPage` + `Person` per team member
   Validate each in Rich Results Test.
2. **[ENG] Breadcrumbs UI + schema** on every deep page.
3. **[CONTENT] Rewrite the three pillar hubs** (`/store`, `/workshop`, `/consultancy`) as keyword-targeted landing pages (H1 on head term, answer-first intro, "Guides" links, FAQ block). Build **/about** into a real E-E-A-T page with named, credentialed bios.
4. **[ENG] Image SEO pass** (`seo-images`): WebP/AVIF, responsive `srcset`, descriptive alt, width/height to kill CLS, lazy-load below fold.
5. **[ENG] CWV/INP work:** gate heavy animations behind `prefers-reduced-motion`, reduce main-thread work from Framer Motion/Lenis on key templates, reserve media space.
6. **[CONTENT] Months 2–3 posts** per calendar; each with `Article`+author schema.
7. **[SEO] GBP claim** for the Mulund cafe (quick local win) + ensure NAP matches `LocalBusiness` schema.

**Phase 2 done when:** Product/Course/Article/FAQ/Breadcrumb schema validate live, hubs rewritten, CWV trending to "Good".

---

## Phase 3 — Scale content & authority (Weeks 13–24 / Months 4–6)

**Goal: scale the long tail, build links, deepen GEO.**

1. **[CONTENT] Sustain 4 posts/mo** (calendar Months 4–6); publish 1–2 **consultancy case studies** as flagship E-E-A-T pieces.
2. **[SEO] Link building** (`seo-backlinks` for gap → targets): Indian coffee/F&B media, supplier/partner pages, roaster directories, guest posts, HARO-style PR. Prioritize the consultancy + academy angles (easier links, unique operator story).
3. **[SEO · GEO] AI-search readiness:** add `/llms.txt`, ensure answer-first passages + `FAQPage` on pillar/guide pages, verify AI crawlers can fetch prerendered HTML; begin tracking brand mentions in AI answers.
4. **[ENG] Internal-linking automation:** related-guides module on hubs/PDPs/courses; ensure no orphans.
5. **[ENG · evaluate] Next.js (App Router) migration assessment.** If prerender hits limits (frequent catalog changes, personalization, scale), scope a move to SSR/SSG/ISR for durable AI-search + performance. Decision gate, not a commitment.
6. **[SEO] Programmatic guardrails** (`seo-programmatic`) before scaling any templated product/location/course pages — enforce unique content, avoid index bloat.

**Phase 3 done when:** full catalog + 12–18 articles indexed, first quality backlinks landed, GEO basics live, internal linking automated.

---

## Phase 4 — Authority & compounding (Months 7–12)

**Goal: topical authority + thought leadership; optimize on data.**

1. **[CONTENT] Thought leadership & cluster expansion** around winning topics; refresh top performers quarterly.
2. **[SEO] Advanced schema** (Review/AggregateRating where genuine, HowTo where allowed, Event for workshops).
3. **[SEO] PR & partnerships** for high-authority mentions; speaking/collabs in the coffee community.
4. **[ENG] Continuous CWV + drift monitoring** (`seo-drift` baseline each deploy to catch regressions from new animations/features).
5. **[SEO] Quarterly review** vs KPI table; reallocate to the pillar with best ROI (likely academy or consultancy given competition).

**Phase 4 done when:** ranking for target head/body terms in ≥1 pillar, steady non-branded organic growth, all templates "Good" CWV, tracked AI citations.

---

## Immediate next 5 actions (this week)
1. **[DONE]** Routes verified OK; Beans/Academy/Blog set to `noindex` + removed from sitemap (owner "prep only").
2. **[SEO]** Verify Google Search Console + submit sitemap; capture baselines.
3. **[ENG]** Stand up prerendering for the static routes.
4. **[ENG]** Add `Product` + `Course` + `Article` JSON-LD components.
5. **[ENG]** Generate the sitemap dynamically (incl. products/courses/posts).

## Tooling map (this plugin)
`seo-technical` (crawl/CWV) · `seo-schema` (generate/validate JSON-LD) · `seo-sitemap` (rebuild) · `seo-google` (GSC/PSI/CrUX baselines) · `seo-content-brief` (per-post briefs) · `seo-dataforseo`/`seo-backlinks` (validate competitor & link estimates) · `seo-geo` (AI readiness) · `seo-drift` (regression monitoring) · `seo-images` (image pass).
