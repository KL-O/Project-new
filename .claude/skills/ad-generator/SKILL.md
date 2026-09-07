---
name: ad-generator
description: >
  Generate complete, platform-ready advertisements including ad copy and a
  Canva-ready creative for Meta (Facebook/Instagram), TikTok, and Google.
  Use this skill whenever the user wants to create an ad, write ad copy,
  build a campaign creative, or turn a product shot into a full advertisement.
  Trigger after product-shot-generator runs, or any time the user says "make
  an ad", "write copy for this", "turn this into an ad", "create a campaign",
  or "I need something to run on [platform]." Always use this skill when
  advertising, copy, or paid traffic is involved. Works for any brand —
  Claude pulls brand context from memory or asks if not available.
---

# Ad Generator

Turn any product visual, offer, or idea into a complete platform-ready ad:
copy + Canva creative, dialed in for the right audience and platform.

## What This Skill Does

Generates full ad packages for Meta, TikTok, and Google including:

- Platform-specific ad copy (headline, primary text, CTA)
- Angle selection based on the offer and audience
- Canva-ready creative sized for the target platform
- Optional: 3 copy variations to A/B test

---

## Brand Context

Claude already knows your brand. Before generating, confirm or pull from
memory:
Brand: [name]
Product / Offer: [what is being advertised]
Target Audience: [who we're speaking to]
Core Pain Point or Desire: [what they feel]
Unique Mechanism / Differentiator: [why this over anything else]
Offer / CTA: [what we want them to do]
Platform: [Meta / TikTok / Google]

If running after product-shot-generator, reuse the brand context and visual
brief already established. Ask only for what's missing.

---

## Ad Angles

Always generate using the best-fit angle for the offer. Default to producing
one version per angle when no preference is given:

| Angle | Best For |
|---|---|
| Pain Point | Cold audiences who don't know the solution yet |
| Aspiration / Desire | Warm audiences, lifestyle brands, transformation offers |
| Social Proof / Results | Retargeting, trust-building, proof-heavy offers |
| Direct Offer / Discount | Bottom-funnel, time-sensitive, price-motivated buyers |

If the user specifies an angle, use only that one. Otherwise generate all
four and label them clearly.

---

## Workflow

### Step 1: Confirm the Brief

Pull brand context from memory. Ask the user to confirm or fill in gaps:

- What is being advertised (product, service, offer)?
- Who is the target audience?
- Which platform(s)?
- Any specific angle or hook they want to lead with?

If they say "just go" — proceed with best judgment and present options.

---

### Step 2: Write the Ad Copy

For each angle selected, write platform-optimized copy:

#### Meta (Facebook / Instagram)
HOOK (first line, stops the scroll):
[1 punchy sentence — question, bold claim, or relatable pain]
PRIMARY TEXT (2-4 sentences):
[Expand the hook, agitate the pain or desire, introduce the solution]
HEADLINE (below the image, 5-7 words):
[Clear benefit or offer]
CTA:
[Learn More / Shop Now / Get Started / Book a Call]

#### TikTok
HOOK (0-2 sec, spoken or on-screen text):
[Pattern interrupt — surprising, relatable, or bold]
SCRIPT (15-30 sec):
[Hook -> Problem -> Solution -> Proof -> CTA]
CAPTION (SEO-optimized, under 150 chars):
[Benefit-forward, include 2-3 hashtags]
CTA OVERLAY TEXT:
[Short, action-driven]

#### Google
HEADLINE 1 (30 chars max): [Keyword-rich, benefit-led]
HEADLINE 2 (30 chars max): [Differentiator or offer]
HEADLINE 3 (30 chars max): [CTA or urgency]
DESCRIPTION 1 (90 chars max): [Expand on benefit, include keyword]
DESCRIPTION 2 (90 chars max): [Social proof or offer detail]

---

### Step 3: Generate the Canva Creative

Use the Canva MCP to produce a platform-sized ad creative:

- Pull the product visual from the previous product-shot-generator output
  if available, or generate a new one using the brand context
- Apply the headline and CTA as text overlays
- Match brand colors and typography

Platform size defaults:
- Meta Feed: 1080x1080
- Meta Story / Reel: 1080x1920
- TikTok: 1080x1920
- Google Display: 1200x628

Use `Canva:generate-design` with the appropriate `design_type` and pass the
copy and visual brief as the generation query.

Return the Canva edit link so the user can refine immediately.

---

### Step 4: Deliver the Full Ad Package

Output in this order:
- BRAND CONTEXT confirmed
- AD COPY — [Angle Name]
  Headline: ...
  Body: ...
  CTA: ...
- CANVA CREATIVE -> [Open in Canva]
--- VARIATIONS ---
[Repeat for each angle if multiple were generated]

Offer at the end:
- "Want me to generate A/B variations for any of these?"
- "Want to test a different angle or hook?"
- "Ready to export or schedule this?"

---

## Notes

- Never use em dashes in copy; use commas, colons, or semicolons instead
- Keep TikTok copy conversational, not corporate
- Google ads must stay within character limits strictly
- Always write the hook first; the rest of the ad flows from it
- For client brands, ask for brand context at the start if not in memory
- If product-shot-generator was just used, skip the visual generation step
  and pull that Canva design directly into the ad layout
