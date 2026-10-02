---
target: landing page vs five-pillar brief
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\SIDDHESH DUMRE\\Desktop\\test\\eli5-explain\\src\\pages\\Landing.tsx"
target_fingerprint: "sha256:58ce9f4205f9c159559fa64470cce65ef764a47c77a04d701ee1d0b3e7264f64"
target_path: "C:\\Users\\SIDDHESH DUMRE\\Desktop\\test\\eli5-explain\\src\\pages\\Landing.tsx"
timestamp: 2026-09-29T18-23-21Z
slug: src-pages-landing-tsx
---
# Critique: ELI5.AI landing vs the five-pillar brief (src/pages/Landing.tsx)
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score: 24/32 (75%, Good), n/a: 7, 10
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Scroll-linked content can rest half-rendered |
| 2 | Match system / real world | 3 | Raw agent queries read as machine noise |
| 3 | User control and freedom | 3 | Pausing mid-scroll leaves feedback blurred |
| 4 | Consistency and standards | 2 | 9 alignment rays; two leadings for one 28px role; strike renders as underline on mobile |
| 5 | Error prevention | 3 | Mobile strike makes wrong answer look emphasised |
| 6 | Recognition rather than recall | 4 | Everything visible; CTA repeats |
| 7 | Flexibility and efficiency | n/a | Persuasion page |
| 8 | Aesthetic and minimalist design | 3 | Omittable words and duplicate links |
| 9 | Error recovery | 3 | Tutor demo pre-answered for the visitor |
| 10 | Help and documentation | n/a | Landing page |

## Design Specificity Verdict
Mostly product-authored (real answers, self-grading quiz, agent searches, stack); skeleton leans on stock defaults (Tailwind cyan-400, shadcn slate, lucide) and a generic H1. Detector: CLI 0 findings; browser 1 (layout-transition, false positive from Sonner global style + unused sidebar CSS); URL scan content-hidden-at-rest 42% (inactive tabpanels intended; scroll pre-states of quiz feedback/searches real).

## Priority Issues
- [P1] 9 alignment rays instead of 2: hero demo at 673 (lg:pl-8) vs quiz 641; research headline alone at 847; stack lines 539/949; CTA note 405; drifting verdicts 879/912; quotes under-hung 2-3px; display type optically indented 3-5px. Fix: rays A=128, B=641 (+40 sub-rays), ruled 2-col stack table, fixed verdict column, hang 0.53em, display -0.055em. /impeccable layout
- [P1] Motion breaks pillar 3: level-in 280ms (>150ms cap); linear scroll-scrubbed blur fades rest half-rendered (feedback 0.57 opacity, 2.6px blur); floaty hero-only parallax with scale+fade; no smooth scrolling. Fix: <=150ms transform-only tab transition; entry-triggered time-based mask reveals ~560ms cubic-bezier(0.16,1,0.3,1); transform-only structural parallax on headlines; smooth scrolling. /impeccable animate
- [P1] Mobile quiz strike renders as an underline (wrapped option; ::after at top:55% sits between lines; "pit" unstruck). Fix: per-line strike via background + box-decoration-break: clone animated with scroll; verdict below option on mobile. /impeccable harden
- [P2] Type rhythm off 4px baseline (9/20 styles), three ratios at 20px, six sizes in a 14px band, inverted optical spacing (H1->lede 34px vs caption 75px). Fix: 88/56/28/20/14; LH 84/56/36/32/28/24; tracking -.035/-.03/-.02/0/+.01em; more room under heavy type. /impeccable typeset
- [P2] Stock icons (arrow, check/X), mid-density stack list, 6px radius off grid, omittable duplicates. Fix: ruled 1px data table, delete icons, 4px radius, omission list. /impeccable distill

## Persona Red Flags
- Jordan: "Your answer" blames a pick never made; raw queries read as noise; mid-scroll blur looks like loading.
- Riley: pause mid-scroll strands blurred feedback; Expert-first makes the quiz's sand-pit reference dangle.
- Casey: strike renders as underline; 20-24px tall text links; 48px H1 vs 44px closing H2 collapse.
- Hiring reviewer: credits native scroll CSS/ARIA/DESIGN.md; catches ray misses, off-baseline leading, stock defaults, mobile strike bug.

## Minor Observations
Unused keyframes ship; nav gap 16 vs footer 24; hero column bottoms staggered; dark theme structurally identical and AAA.

## Questions to Consider
- Why does the page answer its quiz for the visitor?
- Could every movement act out the product (answers arriving line by line as they stream)?
