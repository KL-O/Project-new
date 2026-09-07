# Roadmap — Subscription App Portfolio

Tracks status across every app in this repo so a new session can pick up
where the last one left off. Update this file whenever an app's status
changes meaningfully (shipped a feature, hit a blocker, decided next steps).

Live site root: https://kl-o.github.io/Project-new/
Repo: `kl-o/project-new`, branch `claude/subscription-app-ideas-ky1m43`

---

## 1. Content Idea Generator — `/` (repo root)

**Live**: https://kl-o.github.io/Project-new/
**Status**: Feature-complete, deployed, user is testing before next steps.

What it does: generator gives beginner content creators niche-specific
content ideas. Real AI generation (Cloudflare Worker → Anthropic Claude
Haiku 4.5) with automatic silent fallback to a local template engine if the
Worker is ever unreachable.

Built:
- Core idea generation, save/organize ideas, voice input (Web Speech API)
- "Your Vibe" personalization profile (personality, tone, long-form about-you)
  — lives in a Settings modal (⚙ button, top-right header), not buried
- 3 / 6 / 9 idea count selector
- "Ground in reliable sources" toggle — opt-in web search (max_uses: 1) so
  factual claims (health/fitness/finance-style) can be grounded; off by
  default since it's slower and costs slightly more per generation
- Warm "pinned idea board" visual design (cream/terracotta/pine, Fraunces +
  Inter) — deliberately not the generic dark/purple AI-startup look

Architecture:
- Static frontend: `index.html`, `styles.css`, `js/ideaEngine.js` (local
  templates), `js/aiEngine.js` (Worker caller), `js/app.js` (UI wiring)
- Backend: `worker/src/index.js`, a Cloudflare Worker proxying to
  `api.anthropic.com`. Deployed **manually** via Cloudflare's dashboard code
  editor (copy-paste + Deploy) — NOT connected to this git repo, so any
  change to `worker/src/index.js` needs the user to manually redeploy it in
  Cloudflare after each push. Always tell them when this step is needed.
  - CORS locked to `https://kl-o.github.io`
  - Per-IP daily rate limit (50/day) via Workers KV (binding `RATE_LIMIT_KV`)
  - `ANTHROPIC_API_KEY` stored as an encrypted Cloudflare secret — never
    seen by Claude, never committed
  - Structured outputs (`output_config.format`, `json_schema`) — array
    `minItems`/`maxItems` are NOT supported by Anthropic's structured
    outputs (learned the hard way — caused a silent 400 → fallback loop)

Known constraints:
- This sandbox has no outbound network access — can never verify the live
  site or Worker directly; the user must test and report back (browser
  DevTools Console + Network tab has been the reliable way to get real
  error detail from them)
- Worker deploys are manual (see above) — always give the user the full
  updated `worker/src/index.js` to paste in when it changes

Next steps (user's call, not started):
1. **Validate**: share the live link with real creators before building more
2. **Monetize**: usage cap on free AI generations + Stripe subscription tier
   — only after validation shows real interest

---

## 2. LUT Generator — `/lut-generator/`

**Live**: https://kl-o.github.io/Project-new/lut-generator/
**Status**: Phase 1 shipped and tested. Phase 2 (text-description path) not
started. User wants this for their own personal use too, not just as a
product.

What it does: upload a reference photo (movie still, screenshot, another
creator's shot) → analyzes its actual color (white balance, contrast,
saturation, shadow/highlight color cast) → generates a real `.cube` LUT
file that recreates that look, plus a plain-English settings readout for
manual replication. Before/after slider preview, optionally on a different
photo than the reference.

Architecture (fully static, no backend for Phase 1):
- `index.html`, `styles.css`, `js/colorMath.js` (the actual color pipeline
  + `.cube` file writer, 33³ grid), `js/imageAnalyzer.js` (canvas-based
  pixel analysis → params), `js/app.js` (UI wiring)
- Both the image-analysis path and the future text-description path are
  designed to feed the *same* `colorMath.js` pipeline — only the params
  source changes
- Dark cinematic visual design (charcoal + amber/teal accents, Space
  Grotesk + Inter) — deliberately distinct from the Content Idea
  Generator's warm paper-board look, teal/orange accent choice nods at the
  classic color-grading look the tool itself produces

Fixed during build: `[hidden]` and an author rule setting `display`
explicitly on the same element tie in CSS specificity, and author styles
beat the browser's built-in `[hidden]` rule in that tie — added a global
`[hidden] { display: none !important; }` reset. (Confirmed the Content Idea
Generator doesn't share this bug.)

Original pricing concept from planning (not yet built — no accounts/backend
exist yet, this is aspirational for whenever monetization starts):
- Free: 3 generations/month, watermarked preview, standard resolution
- Creator: $12/mo ($99/yr) — unlimited generations, full-res export, saved
  LUT history
- Pro: $22/mo ($199/yr) — + batch generation, commercial-use license,
  priority processing
- Optional one-off LUT pack sales ($15–25) as a non-subscription lead-in

Next steps:
1. User is about to test Phase 1 live and report back what needs fixing/adjusting
2. **Phase 2**: "describe it in words" path — new Cloudflare Worker (same
   security pattern as the idea generator's) that turns a text description
   into the same params shape `colorMath.js` already expects
3. Monetization/accounts — later, same "validate before building" logic as
   the idea generator

---

## Next app

Once both of the above are in a good place (or if either stalls), the plan
is to pull the next concept from the original brainstormed list. That list
lived only in chat history, not in this repo — if it's not in the current
session's context when this comes up, ask the user to restate the
direction they want rather than guessing.
