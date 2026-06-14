# Site Structure & Information Architecture — Mastermind Brews

**Prepared:** 2026-06-14
**Pattern:** Hub-and-spoke across 3 pillars, hung off a vertically-integrated brand.

---

## 1. URL hierarchy (target)

```
/                                 Home (brand hub → links to all 3 pillars)
│
├── /store                        PILLAR A hub — Buy Coffee   [HIDDEN · noindex now]
│   ├── /store?category=…         Filtered views (keep crawlable facets minimal; canonical to /store)
│   └── /product/:slug            PDP — single bean (recommended pattern when launched)
│
├── /workshop                     PILLAR B hub — Learn Coffee   [HIDDEN · noindex now]
│   ├── /course/:courseId         Course detail (sales page)   [noindex now]
│   └── /learn/:courseId          Course player (gated, noindex)
│
├── /consultancy                  PILLAR C hub — Our Projects (services + case studies)   [LIVE · indexable]
│   └── /consultancy/:caseSlug    (recommended) individual case-study pages
│
├── /blog                         Content engine (spokes feeding A/B/C)   [HIDDEN · noindex now]
│   └── /blog/:slug               Article   [noindex now]
│
├── /about                        Brand / E-E-A-T (team, story, credentials)
├── /baristas                     Barista directory (secondary)
│   └── /barista-signup           Lead form
├── /contact                      Contact / consultancy enquiry
│
└── (noindex / Disallow)          /login /signup /checkout /my-* /wishlist /admin
                                  /order-confirmation /reset-password /forgot-password
```

> **Note:** the dynamic routes are correctly formed (`/blog/:slug`, `/course/:courseId`, `/course/:courseId/checkout`, `/learn/:courseId`) — an earlier "broken routes" claim was a grep artifact. The Store/Academy/Blog universe is currently hidden + `noindex` (owner "prep only"); when launching, decide a single bean PDP pattern (`/product/:slug` recommended) and use it consistently in routes, links, and the sitemap.

---

## 2. Content pillars & hub-and-spoke

Each **pillar hub** is an indexable, keyword-targeted landing page. **Spokes** (blog guides) target informational long-tail and link *up* to their hub; the hub links *down* to its best spokes. This concentrates topical authority.

### Pillar A — Beans (`/store`)
- **Hub target:** "buy single-origin specialty coffee beans online india"
- **Spokes (blog):** brew-method guides (moka pot, French press, pour-over, AeroPress, South Indian filter), bean education (arabica vs robusta, roast levels, grind size), storage/freshness, "which beans for which device".
- **Money pages:** PDPs (`/product/:slug`), subscription.

### Pillar B — Academy (`/workshop`)
- **Hub target:** "online barista course india"
- **Spokes (blog):** how to become a barista in india, barista salary, latte-art tutorials, brewing-ratio guides, home-setup equipment, glossary of coffee terms.
- **Money pages:** course detail pages (`/course/:id`).

### Pillar C — Consultancy (`/consultancy`)
- **Hub target:** "cafe consultant india / how to open a cafe in india"
- **Spokes (blog + case studies):** cafe setup cost breakdown, business-plan template, SOP checklist, menu/beverage program design, choosing equipment, staffing/training.
- **Money pages:** consultancy hub + `/contact`, individual case studies.

---

## 3. Internal linking rules

1. **Every spoke** links to its **pillar hub** with a descriptive anchor (e.g. "our online barista course"), and to 1–2 sibling spokes.
2. **Each hub** features its 3–6 best spokes ("Guides") + cross-links the other two hubs (vertical-integration story).
3. **Home** links to all three hubs above the fold + the blog.
4. **PDPs/course pages** link to relevant guides ("How to brew these beans", "Learn this in our course") — connects money pages to content.
5. **Breadcrumbs** on every deep page (`Home › Store › Product`) with `BreadcrumbList` schema.
6. Avoid orphan pages; cap crawlable facet/filter URLs (canonicalize filtered `/store` views to `/store`).

---

## 4. Schema-per-page-type plan (JSON-LD)

Homepage `@graph` (Organization + WebSite + LocalBusiness) is done. Add per template:

| Page type | Required schema | Notes |
|-----------|-----------------|-------|
| Home | `Organization`, `WebSite`+`SearchAction`, `LocalBusiness` | ✅ exists — keep |
| Bean PDP `/product/:slug` | `Product` + `Offer` (price, availability, INR), `AggregateRating`/`Review` (only if genuine), `BreadcrumbList` | drives shopping/rich results |
| Store hub | `CollectionPage` / `ItemList`, `BreadcrumbList` | |
| Course detail `/course/:id` | `Course` + `Offer` + `hasCourseInstance`, `Provider`=Organization, `BreadcrumbList`, optional `Review` | Course rich results |
| Workshop hub | `ItemList` of courses, `BreadcrumbList` | |
| Blog article `/blog/:slug` | `Article`/`BlogPosting` + `author` (`Person`), `datePublished`/`Modified`, `image`, `BreadcrumbList`; add `FAQPage` if Q&A present | core for E-E-A-T + AI |
| Consultancy hub + cases | `Service` (+ `areaServed` India), `FAQPage`, `BreadcrumbList`; case studies as `Article` | |
| About | `AboutPage`, `Person` for each team member (credentials) | author authority |
| Contact | `ContactPage` | |
| Policies | `WebPage` (keep `noindex`? no — index policies, they build trust) | |

Implementation: a small `<JsonLd data={…} />` component injected per route (prerendered into static HTML — see roadmap), not only client-side.

---

## 5. Sitemap structure (target)

Replace the static 15-URL file with **build-time generation** from the live catalog/CMS:

```
/sitemap.xml                 (index, if it grows)
 ├── /sitemap-core.xml       home, store, workshop, consultancy, about, blog, baristas, contact, policies
 ├── /sitemap-products.xml   every /product/:slug   (changefreq weekly, lastmod = product updated_at)
 ├── /sitemap-courses.xml    every /course/:id       (changefreq monthly)
 └── /sitemap-blog.xml       every /blog/:slug        (changefreq monthly, lastmod = post updated_at)
```

Rules: only **indexable, canonical, 200** URLs; exclude all `Disallow`/noindex routes; real `lastmod` per URL; regenerate on every deploy; resubmit in GSC.

---

## 6. Quality gates (apply before a URL enters the sitemap)
- Unique title + meta description + H1.
- Substantive, non-templated body content (esp. PDPs/courses — avoid thin programmatic pages).
- Correct canonical (self-referential).
- Appropriate schema present and valid (Rich Results Test).
- Internal links in *and* out.
- Renders meaningful content in static HTML (prerendered), not only after JS.
