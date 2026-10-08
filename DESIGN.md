---
name: ELI5.AI
description: Explain anything at your level, then check that it stuck.
colors:
  paper: "#ffffff"
  ink: "#020817"
  ink-secondary: "#414651"
  night: "#090909"
  night-ink: "#ededed"
  night-ink-secondary: "#b4b4b4"
  signal-cyan: "#22d3ee"
  signal-cyan-hover: "rgb(34 211 238 / 0.85)"
  on-signal: "#090909"
typography:
  display:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title-lg:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.015em"
  answer:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Schibsted Grotesk Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  control: "6px"
spacing:
  hairline: "4px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "40px"
  2xl: "48px"
  3xl: "64px"
  4xl: "96px"
  5xl: "128px"
  6xl: "160px"
components:
  button-primary:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.on-signal}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.signal-cyan-hover}"
    textColor: "{colors.on-signal}"
  tab-level:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "48px"
  tab-level-selected:
    textColor: "{colors.ink}"
  link-text:
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
  nav-quiet-control:
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.control}"
    size: "40px"
---

# Design System: ELI5.AI

## Overview

**Creative North Star: "The Printed Answer"**

The system of record is the marketing landing surface (`src/pages/Landing.tsx`): austere editorial monochrome that follows the visitor's system theme, paper white by day and near black by night. The page reads like a well-set essay rather than a software brochure. Real product output (an answer, a quiz correction, a research trace) is set as typography, not framed in mock windows, cards, or chips. Separation comes from whitespace alone on an 8px grid; there are no containers, borders, shadows, or gradients.

Color is almost absent. Ink comes at exactly two strengths, full and 75%, and a single cyan is spent only on the primary call to action. One grotesk family, Schibsted Grotesk, carries everything from 88px extra-bold headlines to 14px captions, with hierarchy made by weight, size, and tight negative tracking at the top of the scale. Motion is authored, never ambient: the level switch resolves the new answer out of a soft blur, and a small set of native scroll-linked animations act out what the product does (the pitch recedes behind the answer, the quiz grades itself as you read it, the research searches arrive in the order they ran). Text is kept short: one-line ledes, terse term-and-detail rows, and real output doing the persuading.

Scope: the in-app chat (`/app`), Profile, Login/Signup/404, and About/Features were not rebuilt in this world. They still run on the shared shadcn tokens in `src/index.css` (see Layout and Do's and Don'ts). New surfaces and migrations should adopt this document.

**Key Characteristics:**
- Theme follows the system (`prefers-color-scheme`), with a manual toggle; no flash on load.
- Two ink strengths (100% / 75%), both AAA in both themes.
- One accent (signal cyan) reserved for the primary CTA.
- One family (Schibsted Grotesk Variable, self-hosted), weights 400 to 800.
- Whitespace-only separation on an 8px grid; asymmetric 12-column layout.
- One control radius (6px). Flat: no elevation at all.
- Motion that enacts product behaviour: a 280ms blur-and-fade on level change plus native CSS scroll-driven animations; the finished state is the default and reduced motion gets it statically.

## Colors

A monochrome page in two inks with a single cyan signal.

### Primary
- **Signal Cyan** (signal-cyan): the fill of the primary CTA ("Ask your first question") and nothing else. Identical in both themes. Text on it is **Signal Ink** (on-signal), near black, which is AAA on the cyan. Hover drops the fill to 85% opacity (signal-cyan-hover).

### Neutral
- **Paper** (paper): light-theme page background.
- **Ink** (ink): light-theme primary text, headlines, selected tab bar, strong emphasis, focus outlines. A near-black with a faint navy cast inherited from the shadcn slate foreground.
- **Ink, Secondary** (ink-secondary): light-theme supporting text: sub-heads, ledes, captions, footnotes, list numerals, unselected tabs, nav controls. Produced as Ink at 75% alpha (`hsl(var(--foreground) / 0.75)`); the hex is its resolved value on Paper.
- **Night** (night): dark-theme page background; also the dark `theme-color`.
- **Night Ink** (night-ink): dark-theme primary text.
- **Night Ink, Secondary** (night-ink-secondary): dark-theme supporting text; Night Ink at 75% alpha resolved on Night.

Text selection inverts: foreground becomes the selection fill and background becomes the selected text. Scrollbar thumbs use foreground at 35% on a transparent track.

### Named Rules
**The One Signal Rule.** Signal Cyan fills the primary CTA and appears nowhere else: not in links, focus rings, tabs, icons, or decoration. The landing root overrides `--ring` to the foreground so even focus stays in ink.

**The Two Inks Rule.** Text uses the foreground at 100% or 75% opacity, never a third tint and never a gray from outside the theme tokens. Emphasis inside prose is weight (600), not color.

## Typography

**Display Font:** Schibsted Grotesk Variable (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Schibsted Grotesk Variable (same family)

**Character:** A single contemporary news grotesk used at both ends of its weight range: compressed-feeling 800 headlines with tight tracking over relaxed 400 reading text at 1.6 leading.

### Hierarchy
- **Display** (800, clamp 3rem to 5.5rem, 0.95): the hero H1 only. The closing statement is a sibling of this role (800, clamp 2.75rem to 4.5rem, 0.98, -0.035em, max 18ch).
- **Headline** (800, clamp 2.25rem to 3.5rem, 1.02): section headings.
- **Title Large** (700, 28px, 1.25): the demo question heading the level switch, and the quiz question (at 1.375 leading, balanced). Opening quotation marks hang into the margin (negative 0.42em indent) so the text keeps its left edge.
- **Title** (700, 24px, 1.375, -0.015em): the quoted research question.
- **Answer** (400, 24px, 1.5, -0.01em, max 44ch from `lg`; 20px at 1.6 below it): the demo answers under the level switch, each two or three complete sentences from a real answer, never cut mid-thought with an ellipsis. The largest reading text on the page; bold terms at 600.
- **Body Large** (400, 20px, 1.6): the hero lede (max 44ch) and tutor feedback (max 48ch). Set lists use this size at tighter leading: quiz options (20px, 1.4) and research searches (20px, 1.5). Level tabs step up to 20px weight 500 from `sm`.
- **Body** (400, 18px, 1.6): section ledes, one short line each (max 32ch), and the build-section lede; level tabs at weight 500 on mobile.
- **Body Small** (400, 16px, 1.6): definition-list detail; terms at 600. Nav links and the CTA label at 500 to 600.
- **Label** (400 or 500, 14px): the two provenance captions ("Excerpts from real ELI5.AI answers." and "AI Tutor Feedback"), the lead-in to a set list ("It searched the web for:"), CTA side notes, footer, quiz state markers. Sentence case, never uppercase-tracked.

Weights in use: 400 reading, 500 controls and captions, 600 inline emphasis and terms, 700 titles, 800 display, headline, and wordmark (18px, -0.02em).

### Named Rules
**The One Family Rule.** Schibsted Grotesk is the only typeface. Hierarchy comes from weight, size, and tracking; never add a second display or mono face.

**The Tighten-As-You-Grow Rule.** Tracking tightens with size: -0.035em at display, -0.03em headline, -0.02em to -0.015em titles, -0.01em on the 24px Answer role, normal at 20px and below.

## Layout

A centered column, max 80rem (1280px), with 24px side gutters on mobile and 48px from `md` (768px). Content sits on an asymmetric 12-column grid from `lg` (1024px): the hero splits 5 / 7 with the product side dominant; proof sections pair a 4- or 5-column statement with a 7- or 6-column artifact, alternating which side leads. Column gaps are 48px.

Vertical rhythm is on the 8px grid: sections breathe at 64px top and bottom on mobile and 128px on desktop (the close takes 160px). Inside a block, steps are 16, 24, 32, and 40px; the hero sits 48px (mobile) / 96px (desktop) below an 80px-tall nav. A 4px half-step appears only between a term and its detail and between an icon and its label.

Below `lg` every grid collapses to one column in reading order (hero: H1, lede, CTA, then the level switch). The build section's definition list is a terse grid: one column on mobile, two from `sm`, three from `lg`, with 48px column and 32px row gaps. The level switch stacks all three answers in one grid cell on desktop so the tallest sets the height and switching never shifts the page; on mobile only the active answer renders.

## Elevation & Depth

None. The world is flat: no box-shadows, no tonal surface layers, no borders, no gradients. Depth and grouping come only from whitespace, type scale, and the two ink strengths. The one spatial effect is motion, not material: on desktop the hero pitch recedes (drifts down and scales slightly) while the answer column scrolls past in front of it; no layer is ever given a shadow or tint to fake depth.

### Named Rules
**The Whitespace Divider Rule.** If two things need separating, add space from the 8px scale. Never a rule line, card, or tinted panel. (Two-pixel ink bars that carry state, the selected-tab bar and the quiz strike, are marks on content, not dividers.)

## Shapes

One radius, 6px (Tailwind `rounded-md`, `calc(var(--radius) - 2px)`), used on interactive controls only: the CTA, tabs, icon buttons, and the focus outline of every link. Content is never enclosed, so it has no corners. The selected-tab indicator is a separate 2px square-ended bar under the label, inset 8px, so the rounded focus outline never bends it.

## Components

### Buttons
Few and plain; the page has exactly one kind that asks for anything.
- **Shape:** gently rounded (6px).
- **Primary:** Signal Cyan fill, Signal Ink label, 16px weight 600, 48px tall, 24px horizontal padding, with a 16px trailing arrow 8px after the label. Always paired with a 14px secondary-ink note beside it ("5 free questions. No sign-up.").
- **Hover / Focus:** hover lowers the fill to 85% opacity with a 150ms color transition; focus shows the ink focus ring.
- **Quiet control (nav icon buttons):** theme toggle and install use ghost buttons in secondary ink with no hover fill; hover only raises the ink to 100%. 40px square (install is 36px tall with a label from `md`).

### Links
- **Style:** text in the surrounding ink, underlined 4px below the baseline with the decoration at 40% of the foreground; hover brings the decoration to full ink.
- **Focus:** 2px solid foreground outline, 4px offset, 6px radius.

### Navigation
A plain 80px bar with no background or border: the orbit mark (20px) and "ELI5.AI" wordmark (18px, 800) left; theme toggle, install (only when the browser can install), "Log in", and "Open the app" right, 8px apart on mobile and 16px from `sm`. "Open the app" shortens to "Open app" on mobile.

### Level Switch (signature)
Three text tabs (ELI5 (Child), Intermediate, Expert) with full ARIA tab semantics and arrow/Home/End keys. Unselected tabs are secondary ink, weight 500 (18px on mobile, 20px from `sm`), 48px tall; the selected tab is full ink over a 2px ink bar. Answers are set in the Answer role (24px from `lg`, 20px below; max 44ch). Changing level plays the level-in motion on the incoming answer: opacity 0 to 1, blur 6px to 0, 4px rise, 280ms `cubic-bezier(0.16, 1, 0.3, 1)`. It is skipped on first render and removed under `prefers-reduced-motion`.

### Set Artifacts (quiz, research trace, definition lists)
Product output is set as typography: numbered or lettered lists with a 24px tabular-numeral column in secondary ink, 16px gap; state is carried by weight (correct option at 600 with a check and "Correct"), a strike (the picked wrong option: a 2px currentColor bar across the text at 55% of its height, over semantic `<s>` with its native line-through removed, so scroll can draw it), and small 16px line icons with sentence-case labels. Quotes (tutor feedback) are indented 40px on desktop with a 14px weight-500 caption below. The stack list sets each term (600) directly above its detail (secondary ink) with a 4px step, in the 1/2/3-column grid described in Layout.

### Scroll-Linked Motion
Native CSS scroll-driven animations only (`animation-timeline`), all with linear timing because scroll is the clock. Every rule sits inside `prefers-reduced-motion: no-preference` and `@supports (animation-timeline: view())`; outside that, the page is its finished, fully visible state. Scrolling back reverses each one.
- **Hero recede (desktop, from 1024px):** the pitch column drifts 88px down and scales to 0.97 from its left-top corner over the first 90vh of root scroll. It holds full opacity until 70% of the range, then fades to 0.3, so the CTA never looks disabled while it is on screen.
- **Quiz self-grading:** the quiz block is a named view timeline (`--quiz`). The strike draws through the wrong pick (scaleX 0 to 1 from the left, cover 22% to 34%), the verdict markers fade in (cover 30% to 38%), then the tutor feedback resolves (cover 34% to 48%).
- **Resolve:** opacity 0, blur 6px, 8px down, to rest. Used by the tutor feedback and by each research search on its own view timeline (entry 10% to cover 30%), so the searches arrive in the order the agent ran them.

**The Motion Enacts the Product Rule.** A motion earns its place only by acting out something the product does: changing level, grading an answer, running a search. No generic fade-up section reveals, hover lifts, or decorative parallax layers.

**The Finished State Default Rule.** The resting CSS is the final state; animation only adds the approach to it. No scroll hijacking, no smooth-scroll or animation libraries, and always a static reduced-motion path.

## Do's and Don'ts

### Do:
- **Do** follow the system theme and support both palettes; set `theme-color` per scheme (paper and night) and apply the theme class before first paint.
- **Do** keep text to the two ink strengths (100% and 75%) and emphasis to weight.
- **Do** spend Signal Cyan only on the one primary CTA per view.
- **Do** separate with whitespace on the 8px scale (16 / 24 / 32 / 48 / 64 / 128px).
- **Do** show real product output set as type; caption it only where provenance is not self-evident, one line in Label style.
- **Do** keep copy short: one-line section ledes (max 32ch), terse term-and-detail rows.
- **Do** keep every interactive target at least 40px tall (48px for the CTA and tabs) and give it the ink focus outline.
- **Do** honor `prefers-reduced-motion` by removing level-in and every scroll-linked animation, leaving the finished state.
- **Do** build scroll motion with native scroll-driven CSS behind `@supports (animation-timeline: view())`, with the finished state as the default.

### Don't:
- **Don't** use cyan for links, focus rings, icons, tabs, highlights, or decoration.
- **Don't** add cards, borders, rule lines, shadows, gradients, glows, or tinted panels.
- **Don't** introduce a second typeface or a third ink tint.
- **Don't** frame product output in fake app windows or device chrome.
- **Don't** use a radius other than 6px, or round content blocks.
- **Don't** add small uppercase labels above headings; captions sit below or beside what they describe, in sentence case.
- **Don't** add motion that does not enact product behaviour: no generic fade-up section reveals, hover lifts, or decorative parallax layers.
- **Don't** hijack scroll or add smooth-scroll or animation libraries.
- **Don't** let a scroll animation dim a live control: fades wait until the element is leaving the viewport.
