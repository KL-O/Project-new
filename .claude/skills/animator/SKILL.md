---
name: animator
description: >
  Analyze scenes, images, or ad creatives and bring them to life with
  detailed animation briefs, storyboards, motion direction, and
  editor-ready instructions for CapCut, Premiere Pro, After Effects,
  DaVinci Resolve, TikTok, and Canva Video. Use this skill whenever the
  user wants to animate anything — product shots, ad creatives, scene
  descriptions, or raw ideas. Trigger when the user says "animate this",
  "bring this to life", "make this move", "create a video from this",
  "storyboard this", "add motion to this", or specifies a video length.
  Works at any duration the user specifies. Always chains with
  product-shot-generator and ad-generator output when available.
---

# Animator

Analyze any visual input or scene description and produce a complete,
editor-ready animation package: scene breakdown, motion direction,
storyboard, timing guide, and tool-specific instructions — all matched
to the brand vibe.

## What This Skill Does

Takes any input (images, ad creatives, product shots, written scenes, or
a plain idea) and produces:

- Scene-by-scene breakdown with motion direction
- Storyboard frames described in detail
- Timing and pacing guide based on target duration
- Brand-matched animation style
- Editor-ready instructions for the user's tool of choice

---

## Supported Input Types

Accept any of the following:

- Static product images (from product-shot-generator or uploaded directly)
- Ad creatives (from ad-generator or Canva)
- Written scene descriptions or a rough concept
- A plain prompt like "make a 15 second TikTok ad for my supplement brand"

If no input is provided, ask for: what is being animated, target platform,
and desired duration. That is the minimum needed to proceed.

---

## Brand Context

Pull brand context from memory before starting:
Brand: [name]
Visual Style / Vibe: [bold, clean, cinematic, energetic, etc.]
Primary Colors: [hex codes or descriptions]
Target Platform: [TikTok / Instagram Reels / Meta Feed / YouTube / other]
Target Duration: [user-specified or ask]
Editor Tool: [CapCut / Premiere Pro / After Effects / DaVinci Resolve /
TikTok native / Canva Video]

If chaining from product-shot-generator or ad-generator, reuse all
established context automatically. Only ask for what is missing.

---

## Animation Style Selection

Match animation style to the brand vibe unless the user specifies:

| Brand Vibe | Animation Style |
|---|---|
| Bold / aggressive | High energy, fast cuts, dynamic text slams, bass hits |
| Clean / minimal | Smooth fades, slow zooms, subtle motion, white space |
| Cinematic / moody | Slow push-ins, color grading cues, dramatic pacing |
| Playful / lifestyle | Bouncy transitions, bright overlays, upbeat rhythm |
| Premium / luxury | Elegant wipes, muted palette, long holds, soft motion |

State the chosen style at the top of the output and explain why it fits
the brand.

---

## Workflow

### Step 1: Analyze the Input

If images or creatives are provided, analyze:

- Subject and focal point of each scene
- Existing colors, composition, and mood
- Natural motion opportunities (product spin, text reveal, zoom, parallax)
- Emotional tone and what feeling the animation should amplify

If only a written description is provided, extract the same information
from the text.

---

### Step 2: Build the Scene Breakdown

Break the full duration into scenes. Default pacing:

| Duration | Scene Count |
|---|---|
| 3-7 sec | 2-3 scenes |
| 8-15 sec | 3-5 scenes |
| 16-30 sec | 5-8 scenes |
| 31-60 sec | 8-15 scenes |
| 60 sec+ | Ask user for scene structure |

For each scene output:
SCENE [#] — [0:00 - 0:03]
Visual: [what is on screen]
Motion: [camera move, element animation, transition in/out]
Text Overlay: [if any — copy, font weight, animation style]
Sound Cue: [beat drop, silence, voiceover, SFX suggestion]
Emotion / Intent: [what the viewer should feel]

---

### Step 3: Write the Storyboard

Describe each frame visually in enough detail that someone can sketch
or build it without seeing the original:
FRAME [#]
Layout: [composition description — subject position, background, layers]
Foreground: [what is closest to camera]
Background: [what is behind]
Motion Direction: [pan left, zoom in 10%, slide up, etc.]
Transition to Next: [cut / dissolve / whip pan / push / fade to black]
Duration: [X seconds]

---

### Step 4: Write Editor-Ready Instructions

Tailor the instructions to the user's editing tool. Include:

#### CapCut
- Clip order and trim points
- Built-in effects and transitions to use by name
- Text animation style (typewriter, pop, slide)
- Beat sync recommendations
- Auto-captions on/off suggestion

#### Premiere Pro
- Sequence settings (resolution, frame rate)
- Cut points with timecode
- Effect suggestions (cross dissolve, dip to black, warp stabilizer)
- Text layer animation keyframe notes
- Color grade mood reference

#### After Effects
- Composition settings
- Layer order and animation type per layer
- Keyframe easing suggestions (ease in/out, overshoot)
- Expression suggestions if relevant
- Plugin recommendations if needed (Element 3D, Optical Flares, etc.)

#### DaVinci Resolve
- Timeline setup (resolution, FPS)
- Fusion page animation notes
- Color page grade direction (LUT style, node suggestions)
- Fairlight audio cue notes
- Cut page vs Edit page recommendation

#### TikTok Native
- Template or effect name to search
- Clip trim and order
- Text style and timing
- Sound/trend recommendation

#### Canva Video
- Canva template style to start from
- Animation preset per element (fade, pop, breathe, pan)
- Transition between pages
- Music mood suggestion from Canva library

---

### Step 5: Deliver the Full Animation Package

Output in this order:
- BRAND VIBE DETECTED: [style name + reason]
- SCENE BREAKDOWN — [X scenes / Y seconds]
  [Scene 1]
  [Scene 2]
  ...
- STORYBOARD
  [Frame 1]
  [Frame 2]
  ...
- EDITOR INSTRUCTIONS — [Tool Name]
  [Step by step]

Offer at the end:
- "Want me to write a voiceover script to lay over this?"
- "Want a version cut down for a different duration?"
- "Want me to generate the product shot or ad creative for scene 1 first?"

---

## Notes

- Never use em dashes in any copy or overlays; use commas, colons,
  or semicolons instead
- Always state the target platform at the top; pacing and aspect ratio
  differ significantly between platforms
- For TikTok and Reels: hook must land in the first 2 seconds; state
  this clearly in Scene 1 direction
- If the user has not specified a tool, ask before writing
  editor instructions; generic instructions are less useful
- If chaining from ad-generator, the headline and CTA copy from that
  skill should be used as the text overlays here
- Sound design cues are suggestions only; always note that the user
  should match to trending audio on the target platform
