# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Output Defaults
- Separate `index.html`, `styles.css`, and small `js/` files split by responsibility — not a single inline-styled file. Match the existing pattern in this repo (see the Content Idea Generator: `index.html` + `styles.css` + `js/ideaEngine.js` + `js/app.js`).
- Plain vanilla CSS — no Tailwind or other CSS framework. This project stays static/client-side with no build step, and framework-free CSS keeps that true.
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Testing / Screenshot Workflow
- This environment has Chromium pre-installed for Playwright at `/opt/pw-browsers/chromium` — do not run `playwright install`; set `executablePath: '/opt/pw-browsers/chromium'` when launching.
- These apps are static files: test by loading directly with `page.goto('file:///path/to/index.html')`. No local dev server is required or set up for this project.
- After any UI change: load the page headlessly, exercise the actual feature, and check for console errors before considering the work done.
- When visual accuracy matters (matching a reference image, verifying a design change), take a screenshot and read it back with the Read tool to actually check it.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.
- No `brand_assets/` folder exists yet in this repo as of this writing.

## Anti-Generic Guardrails
- **Colors:** Never use an unstyled/default framework color (e.g. plain Bootstrap or Tailwind blue/indigo) as primary. Pick a custom brand color and derive the rest of the palette from it.
- **Shadows:** Never use a flat, single-value shadow. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple CSS gradients (`background: radial-gradient(...), radial-gradient(...)`). Add grain/texture via an inline SVG noise filter for depth where it fits.
- **Animations:** Only animate `transform` and `opacity`. Never `transition: all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (CSS `linear-gradient` from transparent to a dark color) and a color treatment layer with `mix-blend-mode: multiply` where appropriate.
- **Spacing:** Use intentional, consistent spacing values (e.g. CSS custom properties for a spacing scale) — not random one-off numbers.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition: all`
- Do not use an unstyled/default framework color as primary
