# Working With AI — Project Documentation

A static HTML slide deck: 15 principles for working with AI as a collaborator, plus a closing
summary slide. Shared `style.css` and `background.js` (canvas particle/flow-field/subdivision
backgrounds) drive the look across `index.html` (landing/TOC) and `01.html`–`16.html` (slides).

## Origin

The original 15-slide deck (`index.html`, `01.html`–`15.html`, `style.css`, `background.js`,
`sidebar.js`) predates this documentation file and was not created in a session this log has
visibility into. This file begins tracking prompts and changes from the session in which it was
introduced (2026-08-13 onward); everything under **Prompt Log** below is verbatim or
close-paraphrase from that session.

## Design Decisions

- **Sidebar defaults open.** The contents panel now ships open by default and pushes the page
  content and bottom nav to the right (`body.sidebar-open .page` / `.sitenav` padding-left),
  rather than overlaying the text. It auto-collapses back to an overlay drawer under 860px
  (`sidebar.js`), where a persistent push-layout would leave no room for the content. The
  push-layout rule intentionally has **no transition** on `padding-left` — an earlier version
  animated it, but since the `sidebar-open` class is added by JS just after first paint, the
  transition was still mid-flight whenever the page was captured/rendered immediately, making the
  layout look broken. Snapping instantly sidesteps that.
- **Slide 16 category colors.** Clarity of Intent = seal magenta (`--seal`), Knowledge = cyan
  (`--neon-cyan`), Articulation = violet (`--violet`, new token, `#7C3AED`), Iteration = deep ink
  (`--ink`). Chosen for perceptual separation while staying inside the site's existing cool
  palette rather than introducing an off-palette warm color.
- **Slide 16 connector diagram.** The principle→theme mapping is one-to-many (principle 10 feeds
  two themes, principle 13 feeds three), so a single static brace/bracket graphic couldn't
  represent it. Instead, each connected `<li>` carries a `data-cat` attribute, and an inline
  script measures every source/target element's bounding box on load/resize and draws colored
  cubic-bezier `<path>`s between them in an absolutely-positioned SVG overlay
  (`.summary-connectors`). Principle 1 has no mapping and is intentionally left unconnected.
- **Background animation tuning** (`background.js`): bounce-mode particle count and radius
  increased for density; flow-field's time evolution slowed roughly 15x so the vector field is
  effectively stable and particles carve out consistent "rivers" instead of the field
  constantly reshuffling; subdivision's recursion depth raised (6→10) and its per-level
  stop-probability lowered (0.22→0.16→ multiple passes) so large panels keep splitting at the
  early levels instead of stopping while still big.
- **Accent recolor** (2026-08-27): `--seal` shifted from neon magenta (`#C21FD6`) to a muted
  brick red (`#B23A2E`) across both sites — the magenta/violet combination wasn't reading well
  against the cool cyan/violet backdrop. Changed everywhere the hex was duplicated outside the
  CSS variable: `background.js`'s hardcoded `SEAL` rgb constant (neon-glint accents), both
  sites' ambient wash gradients, and the slide-16 "Define" category swatch in
  `coding-with-ai/16.html`.
- **Corner motif replaced** (2026-08-27): the static, hand-authored ensō SVG (duplicated
  byte-for-byte across all 34 pages in both sites, breathing via a CSS keyframe) was replaced
  with `motif.js` — a `<canvas>`-drawn hypotrochoid (spirograph). Rolling-circle radius maps to
  cursor X, pen offset maps to Y, both eased toward the target (`+= (target-current)*0.05` per
  frame) rather than snapping; touch drag drives it the same way on mobile; freezes to one
  default shape under `prefers-reduced-motion` instead of animating. Cost is negligible next to
  the full-page noise/flow-field background already running — one ~1600-point stroke per frame
  versus a full per-cell grid scan.

## Prompt Log

Chronological, this session. Mid-turn messages (sent while a prior request was still being
worked) are marked as such.

1. *"make this bold and larger"* (quoting the closing line "Good AI use depends on knowing what
   matters...") → bolded/enlarged that line's treatment in `style.css`.
2. *"make the particles slightly larger, the subdivision contrast slightly higher"* →
   `background.js` particle radius + subdivision opacity tuning.
3. *"Add a final slide that - all 15 principles in one column - second column, aligned to the
   first column's vertical centre with [4 bullets] - a large curly bracket or other gathering
   graphic that funnels the 15 principles to these 4 points"* → created `16.html`, wired into the
   sidebar list, nav counters, and `index.html` TOC across all 16 pages.
4. *(mid-turn)* *"subdivision needs to go on until smaller rects are created - atleast 3-4 more
   levels"* → recursion depth and minimum panel size tuned further.
5. *(mid-turn)* *"on the subpages, instead of Index, Home"* → nav label renamed on all subpages.
6. *"particle + connector effect pages need more particles / particle + noise field - noise field
   needs to either be stable or change far more slowly, let the particles form rivers /
   subdivisions - why are large rectangles not being subdivided at the initial levels - maybe
   increase probability of division just a little bit more"* + *"[quote] on slide 15 - no longer
   needed. Replace the [lede] on 16 with that though"* + *"sidebar needs to be default showing
   not hiding, can be hid on clicking button"* → further `background.js` tuning; quote moved from
   slide 15 to slide 16's lede; sidebar default-open/push-layout implemented.
7. *(mid-turn)* *"Instead of the giant brace, make these connections: [per-principle → theme
   mapping]"* → static brace replaced with the live-computed, color-coded connector diagram.
8. *"Add a documentation file with the original prompt and later updates, design decisions and
   changelog"* → this file.
9. *"I need buttons on both index pages that link to 'go to coding/working with AI' as
   relevant"* → added a `.cross-link` pill button to each site's landing hero, pointing at the
   other site.
10. *"the squiggle on the bottom right of the page - its a leftover from the ink effect I wanted
    initially - replace it with a different svg - a spirograph or other harmonic"* + *"the
    magenta violet isnt working, can we have more violet, less magenta, go from magenta to brick
    red?"* → recolored `--seal` to brick red across both sites; replaced the static ensō SVG
    with a live canvas spirograph (initially static parameters).
11. *"spirograph but can it be live - 2 of the variables plugged into mouseX and mouseY?"* →
    made the spirograph's rolling-circle radius and pen offset track cursor/touch position via
    `motif.js`, eased rather than snapped.

## Changelog

### 2026-08-13
- Bolded/enlarged the closing quote treatment (`.closing .final-line`, `.footline`).
- Increased bounce-mode particle count/size; raised subdivision contrast, then its recursion
  depth and division probability, across several passes.
- Slowed the flow-field noise field ~15x so particle trails settle into stable "rivers."
- Added slide 16, "It All Comes Down to Four Things," wired into sidebar/nav/index everywhere.
- Renamed the subpage nav's "Index" label to "Home."
- Moved the closing quote from slide 15 to slide 16's lede.
- Sidebar now defaults open and pushes page content/nav aside instead of overlaying it; collapses
  to an overlay drawer under 860px; toggled via the close (×) button or the hamburger toggle.
- Replaced slide 16's static curly-brace graphic with a per-principle, color-coded connector
  diagram (SVG bezier curves computed from live DOM positions) mapping each principle to one or
  more of the four closing themes.

### 2026-08-27

- Added a `.cross-link` button to each site's landing hero pointing at the other site
  (`working-with-ai/index.html` ↔ `coding-with-ai/index.html`).
- Recolored `--seal` (and its hardcoded `background.js` counterpart, wash gradients, and
  slide-16 swatch) from magenta `#C21FD6` to brick red `#B23A2E`, in both sites.
- Replaced the static ensō SVG (identical across all 34 pages) with `motif.js`, a live canvas
  spirograph whose rolling-circle radius and pen offset respond to cursor/touch position.
