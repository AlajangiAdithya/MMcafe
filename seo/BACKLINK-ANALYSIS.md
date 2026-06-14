# Backlink Profile Analysis — Mastermind Brews

**Domain:** https://www.mastermindcafe.in
**Date:** 2026-06-14
**Data tier:** 0 — Common Crawl + verification crawler only (no DataForSEO / Moz / Bing keys configured)

---

## Backlink Health Score: INSUFFICIENT DATA (0/7 factors scored)

The only available source, **Common Crawl (cc-main-2026-jan-feb-mar)**, has **no record of `mastermindcafe.in`** (`in_crawl: false`, `in_rankings: false`). All other scoring factors require Moz/Bing/DataForSEO, which are not configured. A numeric score here would be **misleading** — it would imply a *bad* profile when the reality is simply *no data*.

| Section | Status | Data source |
|---------|--------|-------------|
| Profile Overview | no data | Common Crawl → domain not in graph |
| Anchor Text Distribution | no data | needs Moz / Bing / DataForSEO |
| Referring Domain Quality | no data | Common Crawl returned 0 referrers |
| Toxic Links | no data | needs Moz spam score / DataForSEO |
| Top Pages by Backlinks | no data | needs Moz / DataForSEO |
| Competitor Gap | no data | needs Bing / Moz / DataForSEO |
| Link Velocity (new/lost) | no data | DataForSEO only |

### What "not in Common Crawl" means (and doesn't)
- **Does mean:** the site is new/small enough that Common Crawl's sampled web graph hasn't captured inbound links to it yet. This is *normal and expected* for a recently launched site.
- **Does NOT mean:** zero backlinks exist. Common Crawl is a lag-y sample, not a complete index. You may already have a handful of links (social profiles, a directory listing) that simply aren't in CC's graph.
- **Verdict:** treat the backlink profile as **nascent / effectively greenfield**. The opportunity is to build it deliberately — not to "clean up" anything (there's nothing toxic to disavow because there's nothing measured).

---

## How to get a real, scoreable profile (free, ~15 min)

You can't score a profile without inbound-link data. Three free sources, in priority order:

1. **Google Search Console "Links" report** — *the best free source for your OWN site's backlinks.* You already need to verify GSC (it's Phase-1 action #3 in `IMPLEMENTATION-ROADMAP.md`). Once verified, `Links → External links → Top linking sites` shows your actual referring domains and anchor text.
2. **Bing Webmaster Tools** (free) — inbound links report + the only free *competitor comparison*. Verify at https://www.bing.com/webmasters, then this skill's `bing_webmaster.py` can pull links/anchors and compare you vs Blue Tokai etc.
3. **Moz Link Explorer API** (free tier, 2,500 rows/mo) — Domain Authority, Page Authority, **Spam Score**, anchor distribution. Sign up at https://moz.com/products/api, then add the key so this skill can produce a real 0–100 health score.

Setup (either env var or config file):
```
# Option A — env vars
setx MOZ_API_KEY "your-token"
setx BING_WEBMASTER_API_KEY "your-key"

# Option B — config file
C:\Users\alaja\.config\claude-seo\backlinks-api.json
{ "moz_api_key": "...", "bing_api_key": "..." }
```
Then re-run `/claude-seo:seo-backlinks` for a scored profile + competitor gap.

---

## Starter link-building plan (actionable now, no data needed)

Since the profile is greenfield, the job is acquisition. Prioritized for the three pillars (beans / academy / consultancy), Pan-India. This expands Phase 3 of the roadmap.

| # | Opportunity | Pillar | Effort | Why it works for you |
|---|-------------|--------|--------|----------------------|
| 1 | **"Best specialty coffee roasters in India" listicles** — outreach to be added | A | Med | Editors actively maintain these; a real roastery with provenance is an easy "yes" |
| 2 | **Cafes you've consulted for → "Powered by / Coffee by Mastermind" footer link** | C | Low | Unique dofollow B2B links competitors can't replicate; pure vertical-integration advantage |
| 3 | **Origin/estate (Chikmagalur) + supplier/partner pages** | A | Low | Legitimate B2B links + provenance authority |
| 4 | **Digital PR via HARO / Qwoted / SourceBottle** — answer as coffee experts | All | Med | Earns editorial links from real publications; feeds E-E-A-T |
| 5 | **Indian food/lifestyle media features** (Homegrown, CNT India, local Mumbai food press) | A/B | Med | High-authority editorial; pitch the academy + roastery story |
| 6 | **Coffee/barista course & education directories** — list the academy | B | Low | Topical relevance for the least-contested pillar |
| 7 | **F&B / startup / consultancy directories + case-study features** | C | Low | Targets the high-authority-advantage pillar |
| 8 | **Local citations / NAP** (Justdial, Zomato, Swiggy, Sulekha, Google Business Profile) | — | Low | Trust + consistency signals; cheap even though local is deprioritized |
| 9 | **YouTube channel** (brewing/latte-art tutorials) → embeds + profile/description links | B | Med | Drives the academy funnel; videos earn embeds (links) |
| 10 | **Coffee communities** (r/IndiaCoffee, barista forums, Discords) | All | Low | Referral traffic + brand mentions that fuel GEO/AI citations (not just links) |

**Anchor-text guidance from day one** (avoid future over-optimization): keep it natural — mostly **branded** ("Mastermind Brews", "mastermindcafe.in") and **naked URLs**; use exact-match keyword anchors (`buy coffee beans online`) **sparingly (<10%)**.

---

## Next steps
1. **Verify GSC** (also Phase-1 of the main plan) → instantly get your real backlink list + anchors.
2. Add **Moz + Bing** free keys → re-run this skill for a scored profile and competitor gap vs Blue Tokai / academy / consultancy rivals.
3. Start opportunities **#1–#4** (highest ROI, lowest effort) — especially **#2 (consulted-cafe footer links)**, which is your unfair advantage.
4. Re-check Common Crawl in a future release once the site has matured and earned links.

*Tier 0 snapshot only — no link velocity, toxic, or authority scoring is possible until a richer source is connected.*
