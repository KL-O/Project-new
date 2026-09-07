---
name: frontend-design
description: Design and build guidance for this project's web apps (Content Idea Generator, LUT Generator, and future subscription tools). Invoke before writing or editing any HTML/CSS/JS in this repo.
---

# Frontend Design Rules for This Project

## Always Do First
Before writing any frontend code in this repo, apply the anti-generic design
guardrails below. Every product in this project is a client-facing
subscription app judged on visual polish, so default styling choices matter.

## Output Defaults
- Keep it static/client-side: plain HTML, CSS, and vanilla JavaScript, no
  backend and no build step, unless a feature genuinely requires one (e.g.
  real payment processing).
- One page per app (`index.html`), a dedicated `styles.css`, and app logic
  split into small `js/` files by responsibility (see `js/ideaEngine.js` +
  `js/app.js` in the Content Idea Generator for the pattern to follow).
- Mobile-first responsive layout.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and
  color as closely as possible. Swap in placeholder content only where the
  reference doesn't specify real content. Do not "improve" or add to the
  design beyond what's shown.
- If no reference image: design from scratch applying the guardrails below.

## Testing Workflow (adapted for this environment)
- This environment has Chromium pre-installed for Playwright at
  `/opt/pw-browsers/chromium` (do not run `playwright install`; set
  `executablePath: '/opt/pw-browsers/chromium'` when launching).
- Since these apps are static files, they can be tested by loading them
  directly with `page.goto('file:///path/to/index.html')` — no dev server is
  required for this project's current apps.
- After any UI change: load the page headlessly, exercise the actual feature
  (click buttons, fill inputs, check results render), and check for console
  errors before considering the work done. See the Content Idea Generator
  build for an example test script.
- Take a screenshot when visual accuracy matters (matching a reference image,
  or verifying a design change looks right) and read it back with the Read
  tool to actually check it.

## Brand Assets
- Check for a `brand_assets/` folder in the repo root before designing. If
  it contains logos, color palettes, or style guides, use them exactly —
  never invent brand colors or swap in a placeholder logo when a real one
  exists.
- No `brand_assets/` folder exists yet in this repo as of this writing.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette colors (indigo-500,
  blue-600, etc.) or an unstyled browser default. Pick a deliberate custom
  color and derive the rest of the palette from it.
- **Shadows:** Avoid flat, single-value shadows. Use layered, subtly
  color-tinted shadows with low opacity for depth.
- **Typography:** Don't use the same font for headings and body text where
  the design calls for hierarchy. Apply tighter letter-spacing on large
  headings, generous line-height (~1.6-1.7) on body text.
- **Animations:** Only animate `transform` and `opacity` for performance.
  Never use `transition: all`.
- **Interactive states:** Every clickable element needs hover, focus-visible,
  and active states — no exceptions. (See `.chip:hover`, `.save-btn:hover`,
  `#generateBtn:hover` in the Content Idea Generator's `styles.css` for the
  existing pattern.)
- **Spacing:** Use a consistent set of spacing values throughout a page
  rather than arbitrary one-off numbers.
- **Depth:** Give surfaces a clear layering system (base background →
  elevated card → floating element like a button or modal) rather than
  letting everything sit at the same visual plane.

## Hard Rules
- Do not add sections, features, or content beyond what was asked for.
- Do not use `transition: all`.
- Do not use default Tailwind blue/indigo (or equivalent unstyled defaults)
  as a primary color.
- Always test the actual page in a headless browser before saying a UI
  change is done — see Testing Workflow above.
