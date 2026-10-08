---
version: 1
slug: "src-pages-landing-tsx"
primary_target: "src/pages/Landing.tsx"
related_targets: ["index.html","src/components/InstallPWA.tsx"]
---

## Scope
Route `/` (src/pages/Landing.tsx), plus index.html meta and the shared InstallPWA button. Mode: **Persuade**.

## Audience, action, proof
- Professionals ramping up on a topic, and portfolio evaluators (AI/LLM, full-stack, frontend/design reviewers, freelance clients).
- Action: "Ask your first question" -> /app (5 free guest questions, no sign-up).
- Proof: real ELI5.AI output only (black-hole answer at three levels, a Knowledge Check with AI Tutor Feedback, an Agentic Web Search trace), plus a factual "How it's built" section with the GitHub link.
- Constraints: user brief pins monochrome neutral base, exactly one accent (primary CTA only), AAA text contrast, no gradients/glows/cards/borders, asymmetric editorial layout, dramatic type scale, strict spacing/radius grid. Theme follows the visitor's system (light and dark).

## Direction contract
THESIS: The page proves the product by letting the visitor read one real answer at three levels before clicking anything. It refuses the dark AI-SaaS template: glow hero, fake app window, zigzag icon-card rows, social-proof close.
OWN-WORLD: Austere editorial monochrome on the app's own tokens, paper white or near black per system theme. Ink at exactly two strengths (100% and 75%, AAA in both themes). One cyan (#22d3ee) spent only on the primary CTA. Schibsted Grotesk as the single family: 800 display, 400/500 text. No containers, borders, shadows, gradients or icon chips; separation by whitespace on an 8px grid; one 6px radius for controls.
STORY: The visitor sees "same question, three levels", flips ELI5 (Child) to Expert and watches the analogy sharpen, sees a quiz answer corrected by the tutor, sees the research agent's trace, sees how it is built, then asks their first question.
FIRST VIEWPORT: Asymmetric 12-column grid. Left 5 columns: H1 "Explain anything, simply & clearly." at clamp(3rem, 7vw, 5.5rem), weight 800; a two-line sub; cyan CTA with "5 free questions, no sign-up" beside it. Right 7 columns (dominant): the question at 28px, a three-tab level switch, and a short real answer set at 24px / 44ch showing how that level explains the event horizon. Above: a plain nav with the wordmark left and theme toggle, install (only when installable), Log in and Open app right. Mobile order: H1, CTA, switch.
FORM: The user locked the form in the critique question round (hero = level switch, theme follows system, "How it's built" section). No concept-seed roll ran because the composition was pinned by the user's brief and answers. Code-led (no image generation). Signature interaction: switching level cross-fades the answer (opacity + blur, 280ms exponential ease-out). Scroll motion (added on user request, native CSS scroll-driven, finished state by default, removed under reduced motion): the hero pitch recedes behind the answer column on desktop; reading down the quiz grades it (strike draws through the wrong pick, verdicts appear, tutor feedback resolves from blur); the research searches resolve in the order the agent ran them. No generic reveals or decorative parallax.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- og:image for link previews (needs a real rendered asset).
- Whether /about and /features survive (still unlinked).
