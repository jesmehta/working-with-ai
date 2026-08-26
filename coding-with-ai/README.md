# Coding with AI

A static HTML slide deck — 15 principles for using AI as a coding collaborator without
losing legibility, editability or independence — plus a closing synthesis slide. It is the
companion site to [Working With AI](../working-with-ai), sharing the same visual language
(Bree Serif headlines, Comfortaa body text, an ink-wash sumi-e aesthetic on a cyan/lavender/
blue-violet pastel background with neon accents) and, as of this version, the same page count
(16) and grouped-list structure.

## Origin

Content follows [`working-with-ai-for-code-condensed.md`](./working-with-ai-for-code-condensed.md),
which supersedes the earlier, longer `working-with-ai-for-code-content-structure.md` (23
principles across 7 groups). The condensed version consolidates that into 15 principles across
6 groups plus a Final Summary, matching the shape of the companion site. The only deliberate
departure from the source file is the site title: **Coding with AI** is used throughout
`<title>` tags, the landing page `<h1>`, and page titles, rather than the file's own heading.

The site is generated from structured content data rather than hand-authored page by page, so
a content or structural edit only has to happen in one place to stay consistent across the
nav links, sidebar, page counters, and TOC groupings on every page.

## Structure

```
index.html          Landing page — hero, intro, Core/Companion Principle, grouped TOC
01.html – 15.html    One principle per page, grouped under 6 themes (see below)
16.html              Closing synthesis: all 15 principles connected to the 5
                      responsibilities from the Final Summary, via a live-computed diagram
style.css            Shared design system (typography, palette, components, layout)
background.js        Generative canvas background — one effect per page, not cycling
sidebar.js           Contents drawer: push-layout on desktop, overlay on mobile
connectors.js        Draws the bezier connector diagram on page 16 (positions computed
                      live from the DOM, redrawn on resize and on sidebar toggle)
motif.js              Live spirograph (hypotrochoid) drawn on <canvas>, shared by every
                      page — rolling-circle radius and pen offset ease toward cursor/
                      touch position, frozen to one shape under prefers-reduced-motion
```

## The 6 groups (15 principles)

1. **Start With Intent** — 1–3
2. **Make the Project Legible** — 4–6
3. **Structure for Human Editing** — 7–9
4. **Build Tools for Yourself** — 10–11
5. **Work Safely with AI-Generated Code** — 12–14
6. **Build Toward Independence** — 15
7. **Summary** — 16 (closing synthesis)

## Design system

- **Type** — Bree Serif for headlines and pull quotes, Comfortaa for everything else, loaded
  via `<link rel="preconnect">` + stylesheet (not a CSS `@import`, which blocks first paint).
- **Palette** — cyan/lavender/blue-violet pastel wash (`.bg-wash`, a `position:fixed` div
  behind the canvas, sized in viewport units so it doesn't fall short on long pages) with
  brick red (`--seal`), cyan (`--neon-cyan`), violet (`--violet`) and electric blue
  (`--accent-blue`) accents.
- **Generative backgrounds** — three effects (`bounce`, `flowfield`, `subdivision`), assigned
  one per page via `data-mode` on `<canvas id="bg">` and never cycling at runtime. All three
  render as semi-transparent ink strokes so the pastel wash stays visible underneath.
- **Corner motif** — a live spirograph (hypotrochoid) drawn on `<canvas>` in the lower-right
  corner of every page (`motif.js`), replacing an earlier static hand-drawn ensō SVG. The
  rolling-circle radius tracks cursor/touch X, the pen offset tracks Y, both eased rather than
  snapped; freezes to one default shape under `prefers-reduced-motion`.
- **Sidebar** — lists all 15 principles grouped by theme, current page highlighted. Defaults
  open and pushes page content aside on desktop (≥861px); collapses to an overlay drawer with
  a dimming backdrop under 861px, default closed there. The open/closed state lives as a single
  `sidebar-open` class on `<html>`, set synchronously by an inline script in `<head>` so there's
  no flash of the wrong layout before the external scripts load.
- **Components** — `.card` (weak/better and labelled-row comparisons), `.quote`, `.principle`
  (Core/Companion Principle callouts), `.takeaway`, `.codeblock` (monospace, for JSON/file-tree/
  config snippets), `.pillrow` (tag-style sets with no implied sequence), `.bullets`, `.levels`
  (numbered definition list), `.flow` (step sequence, arrow-connected — supports both a plain
  `→` for progressions and a `↔` for the doc's "X compared with Y" pairs, e.g. Intent ↔
  Implementation).
- **Performance** — no `backdrop-filter` blur anywhere: the sidebar defaults open and sits in
  front of the constantly-animating canvas, so a live blur there would force continuous
  re-composition every frame. Translucent panels use flat opacity instead. No decorative
  film-grain filter, either — it cost more in decode time than it added visually.

## Page 16: the closing synthesis

Rather than a static "gathering" graphic, page 16 measures the real DOM positions of each
principle `<li>` and each of the five theme cards (Define / Document / Structure / Inspect /
Decouple — the Final Summary's five responsibilities) and draws colored cubic-bezier curves
between them in an absolutely-positioned SVG overlay. The mapping is many-to-one: several
principles feed more than one theme (e.g. principle 14, Version Control, feeds both Inspect
and Decouple). Principle 15 is left intentionally unconnected — it's the bridge the summary is
built from, not an input to it. The diagram redraws on window resize and whenever the sidebar's
push-layout changes the available width (watched via a `MutationObserver` on
`<html class="sidebar-open">`).

## Credits

Author: **Jesal Mehta**. Built with Claude.
