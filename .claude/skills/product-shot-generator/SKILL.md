---
name: product-shot-generator
description: >
  Generate on-brand product visuals and social media ad creatives ready to
  open and edit in Canva. Use this skill whenever the user wants to create
  product shots, ad creatives, promotional visuals, or branded image concepts
  from any input (photo, logo, hex codes, product description, or brand
  guidelines). Trigger even if the user just says "make a product shot",
  "generate an ad visual", "create something for social", or "turn this into
  a creative." Always use this skill when images, brand assets, or product
  visuals are involved.
---

# Product Shot Generator

Generate scroll-stopping social media ad creatives from any brand input and
deliver them as Canva-ready designs the user can edit immediately.

## What This Skill Does

Takes any combination of brand inputs (images, colors, logos, fonts,
guidelines, or a plain description) and produces:

- A structured visual brief (composition, mood, color palette, copy
  placement)
- A detailed image generation prompt optimized for the chosen tool
- A Canva design opened and ready to edit, using the generated visual as the
  hero asset

## Input Types Accepted

Accept any of the following; the user does not need to provide all of them:

- Product photos or mockup images
- Logo file (PNG, SVG)
- Brand hex codes
- Font names or typography preferences
- Written brand guidelines or a brand description
- A plain text description of the product ("a pre-workout supplement, bold
  and aggressive brand")

If no brand assets are provided, ask the user for at minimum: product name,
brand vibe (1-3 adjectives), and primary color.

## Workflow

### Step 1: Extract Brand Context

Parse whatever inputs the user provides. Build a brand context object:
Brand Name: [name]
Primary Colors: [hex codes or descriptions]
Fonts: [if known]
Vibe / Tone: [bold, minimal, luxe, playful, etc.]
Product: [what is being shown]
Platform Target: [Instagram, TikTok, Facebook — ask if not stated]

If key info is missing, ask one focused question before continuing.

---

### Step 2: Write the Visual Brief

Output a short brief before generating anything:
VISUAL BRIEF
Composition: [e.g., centered product, diagonal split, overhead flat lay]
Background: [color, texture, scene]
Lighting: [studio, natural, dramatic, soft]
Mood: [energetic, clean, cinematic, etc.]
Color Palette: [primary + accent + neutral]
Text / Copy: [headline suggestion + CTA if applicable]
Platform Size: [1080x1080, 1080x1920, etc.]

Show this to the user and confirm before proceeding, or proceed automatically
if they said "just go for it."

---

### Step 3: Generate the Image Prompt

Write a detailed prompt optimized for the image generation tool being used.
If the tool is not specified, default to writing a prompt compatible with
DALL-E 3 / Midjourney / Canva AI (universal style).

Prompt structure:
[Product description], [composition], [lighting], [background],
[color palette], [mood], [style: photorealistic / illustrated / 3D],
[platform: Instagram ad], [aspect ratio], no text, no watermark,
ultra high quality, sharp focus

---

### Step 4: Deliver in Canva

Use the Canva MCP to:

1. Generate the design using the visual brief and prompt via
   `Canva:generate-design` with `design_type: instagram_post` (or the
   appropriate platform size)
2. Return the Canva edit link so the user can open and customize immediately

If Canva generation is unavailable, output the full prompt and brief so the
user can paste it into their tool of choice, then offer to create a Canva
template manually.

---

## Output Example
✅ Visual Brief confirmed
✅ Image prompt generated
✅ Canva design created → [Open in Canva]

---

## Notes

- Always match platform aspect ratio to the target (1:1 for feed, 9:16 for
  stories/reels, 1.91:1 for Facebook feed)
- If the user provides an existing product photo, use it as the reference
  image in the prompt (pass as asset to Canva or describe it precisely)
- Keep copy minimal on the visual; suggest headline text as an overlay in
  Canva, not baked into the image
- If brand guidelines conflict with what looks good for ads, flag it and
  suggest a compromise
