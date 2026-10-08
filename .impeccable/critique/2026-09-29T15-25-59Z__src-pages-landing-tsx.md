---
target: landing page (src/pages/Landing.tsx)
total_score: 16
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\SIDDHESH DUMRE\\Desktop\\test\\eli5-explain\\src\\pages\\Landing.tsx"
target_fingerprint: "sha256:a1ef52e720d1bbadaab496fae469de167dfaa625b64305f5d9fdbe3a0f893ce1"
target_path: "C:\\Users\\SIDDHESH DUMRE\\Desktop\\test\\eli5-explain\\src\\pages\\Landing.tsx"
timestamp: 2026-09-29T15-25-59Z
slug: src-pages-landing-tsx
closed: true
---
# Critique: ELI5.AI landing (src/pages/Landing.tsx)
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score: 16/32 (50%, Acceptable), n/a: 7, 10
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Disabled Install App explained only by title tooltip; 5 free guest questions never communicated |
| 2 | Match system / real world | 3 | Plain language + real analogy demo; filler "state-of-the-art AI" (L61), "decode the universe" (L192) |
| 3 | User control and freedom | 3 | Fixed nav keeps CTA and Log in reachable |
| 4 | Consistency and standards | 1 | Three brand names (L19, L208, L210) + tab title; "ELI5 Active" not a real level; 9 hard-coded near-blacks; 5 radii |
| 5 | Error prevention | 2 | "Try for Free" implies paid tier; unannounced 5-question wall; dead Install click |
| 6 | Recognition rather than recall | 2 | Two of three features have no picture of the real UI |
| 7 | Flexibility and efficiency | n/a | Single-path persuasion page |
| 8 | Aesthetic and minimalist design | 1 | Grid, 3 glows, gradient text, fake window chrome, 3 icon chips, 2 empty 400px panels |
| 9 | Error recovery | 2 | Only error surface (Install unavailable) is a tooltip, invisible on touch |
| 10 | Help and documentation | n/a | Landing page |

## Design Specificity Verdict
Category-interchangeable dark AI-SaaS template. Only the black-hole trampoline exchange (L92-98) and quiz mockup are product-specific. Core thesis (same question, your level, then prove it) never shown: difficulty illustrated by empty CPU box (L116), grounding by database icon (L169). Detector: CLI 2 findings (gradient-text L55, side-tab L152); browser 14 elements / 9 rules: ai-color-palette x4 (L55,75,115,168), dark-glow x2 (L66, InstallPWA.tsx:38), side-tab x2 (L152-153), gpt-thin-border-wide-shadow (L77), codex-grid-background (L11), low-contrast footer 2.7:1 (L206), nested-cards x5 (mockup bubbles). False positives: layout-transition (shadcn sidebar CSS), page-level gradient duplicates.

## Priority Issues
- [P0] Unbackable claims + brand drift: "Join thousands of learners" (L192, untrue per PRODUCT.md), "instead of AI hallucinations" (L178), "Try for Free" x3 implying paid tier, four product names incl. index.html meta. Fix: delete L192, mechanism not guarantee, ELI5.AI everywhere (c)2026, honest CTA, fix meta. Command: /impeccable clarify
- [P1] Core mechanism invisible: empty icon panels (L114-117, L167-170), hero mock lacks level selector/input and is 40% empty, quiz shows wrong+right simultaneously without AI Tutor Feedback. Fix: hero = level switch (Child/Intermediate/Expert), real artifacts (research trace, Knowledge Check + feedback, snapshot card). Command: /impeccable shape
- [P1] Visual language contradicts brief: 3 accent hues (cyan, blue, red), 7+ gradients/glows incl. hover-growing glow (L66), grid, fake chrome, pill badge, icon chips, 2px colored side borders. Fix: monochrome + one accent on primary CTA only; solid headline; delete decoration. Command: /impeccable distill, /impeccable quieter
- [P2] Identical zigzag rows + flat scale: three 50/50 rows with 400px panels, border-y bands, 90vh centering leaves ~170px dead band, h2s all 30px vs 72px h1. Fix: asymmetric hero, editorial sequence of varying widths, whitespace separation. Command: /impeccable layout
- [P2] Typography + a11y: system-ui only, font-light body on near-black, h1 line-height collapses to 1.0 at lg, bad wraps, footer 2.7:1/4.3:1, <a><button> double tab stops, icon-only Install named by title. Fix: real display face + scale, 400 body + text-wrap pretty, AAA text, Button asChild, render Install only when available. Command: /impeccable typeset, /impeccable harden

## Persona Red Flags
- Jordan: ELI5 never expanded; "AI-Powered Learning" empty; "Try for Free" implies card; levels never named; CPU box meaningless; Install dead.
- Riley: false user count; hallucination guarantee; L142 conflates Standard format with quiz toggle; "ELI5 Active" invented; quiz double selection; (c)2025; <a><button>.
- Casey: first 844px is 4-line headline + paragraph + CTA, proof starts ~730px down; ~800px of empty icon panels; crowded nav.
- Priya (professional ramping up): wants the input, gets three pitches; Expert depth never shown.
- Hiring reviewer: no stack evidence, no built-by/GitHub; template reads as boilerplate; empty panels read unfinished; landing always-dark vs /app theme-following.

## Minor Observations
9 hard-coded near-black surfaces bypass tokens; placeholder icons ~1.7:1 read as broken images; copy drifts from product terms; hero answer truncated; no footer links; no og:image; mobile orphans.

## Questions to Consider
- What if the hero were the level switch, read at Child then Expert before any click?
- Is "/" a pitch or a case study for evaluators?
- If every decoration were deleted, what would the page lose, and where should the one cyan go?
