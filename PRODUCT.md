# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: professionals ramping up on an unfamiliar topic.** They need a new concept for work (a technology, a scientific idea, a piece of current news), want the core intuition in minutes, then go deeper on the same topic once the basics land. They move between levels: often starting at ELI5 (Child) or Intermediate for the intuition, then Expert for precision.

**Evaluators (because this is a portfolio piece).** People judging the builder through the app:

- hiring managers for **AI / LLM engineering** roles (agentic search, structured output, streaming, prompt design);
- reviewers for **full-stack engineering** roles (React + FastAPI + Supabase auth/RLS + deployment, end to end);
- reviewers for **frontend / product design** roles (UX, interaction quality, visual craft, PWA, theming);
- prospective **freelance clients** deciding whether the builder can ship a polished product for them.

Evaluators typically open the live link, try a question or two as a guest, and judge what the app does and how well it is built at the same time.

## Product Purpose

ELI5.AI turns any question into an explanation pitched at the learner's level, built around one real-world analogy, grounded in factual sources, and followed by a check that the learner actually understood.

- **Success for a user:** they grasp a new concept in minutes and can prove it.
- **Success for the project:** evaluators leave convinced the builder can ship a production-grade AI product end to end.

**Stage:** portfolio / showcase project. Free to use, not commercial, no paid plans.

## Positioning

A generic chatbot answers; ELI5.AI makes the learner understand. It combines four mechanisms, all of which are core:

1. **Analogy at your level.** Every answer is built around one cohesive real-world analogy, pitched at ELI5 (Child), Intermediate, or Expert, in Standard, Storytelling, or Technical Breakdown format.
2. **Proving understanding.** Socrates Quiz generates three multiple-choice questions from the explanation; a wrong answer triggers a short, encouraging tutoring explanation of why.
3. **Grounded answers.** Basic Wikipedia pulls factual context before answering; Agentic Web Search runs a research agent (LangGraph + Tavily) for current topics. The backend streams the Wikipedia context and the agent's search steps, but the chat UI does not display them yet.
4. **Shareable learning.** Any explanation can be exported as a snapshot card to share.

## Operating Context

- **Guest flow:** 5 free questions per browser, then a sign-up prompt. This is how most evaluators experience the app, so it is the first impression.
- **Signed-in flow:** Supabase email sign-up/login; conversation threads are saved and resumable from the sidebar; a Profile page stores display name, profession, and interests.
- **Answers stream in** word by word; quizzes appear below the answer when Socrates Quiz is on.
- **Installable as a PWA.** Light and dark themes, following the system setting by default.
- **Deployment:** Vercel (static frontend + Python serverless function under `/api`). Local development via `start.bat`.

## Capabilities and Constraints

**Terminology (use consistently):**

- Assistant persona: **Socrates**.
- Difficulty levels: **ELI5 (Child)**, **Intermediate**, **Expert**.
- Formats: **Standard**, **Storytelling**, **Technical Breakdown**.
- Sources: **Basic Wikipedia**, **Agentic Web Search**.
- Quiz surfaces: **Socrates Quiz** (toggle), **Knowledge Check** (quiz card), **AI Tutor Feedback** (wrong-answer explanation).

**Technical constraints:**

- LLM inference runs on Groq. Groq retires models, so the model must stay configurable (`GROQ_MODEL`; default `openai/gpt-oss-120b`).
- Web search depends on a Tavily key; login and history depend on Supabase. Guest mode must keep working when either is unavailable.
- Chat data is protected per user by Supabase Row Level Security.
- The 5-question guest limit is enforced in the browser only.

**Open decisions:**

- Server-side rate limiting for guest requests.
- Acquiring the eli5.ai domain.
- Whether the `/about` and `/features` pages stay; they exist but nothing in the app links to them.

## Brand Commitments

- **Name: ELI5.AI** is canonical. "ELI5 Universe Builder" (README, landing footer) and the browser-tab title "eli5-explain like I am 5" are legacy variants to retire.
- **Assistant voice** (encoded in the answer prompts): starts the explanation immediately, with no preamble like "Sure!" or "Here is an explanation of…"; ends naturally, with no cheesy closers like "Hope that helps!"; structured as a one-sentence hook, the core analogy, then a one-sentence practical takeaway. Corrections are encouraging, never scolding.
- **Mark:** the orbit icon is used as the favicon, PWA icon, loading-screen mark, and on the share card. (Legacy pages use a brain icon instead.)
- **License:** proprietary, all rights reserved (see `LICENSE`).

## Evidence on Hand

**Real and usable:**

- The working app itself; any demo or showcase content should come from real output (explanations, quizzes, tutor feedback, snapshot cards).
- The example on the landing page ("How exactly do black holes work?" with a trampoline analogy).

**Absent; future work must not fabricate:**

- **User numbers.** There is no user base to cite. The landing page's "Join thousands of learners" is not true and should not be repeated.
- **Testimonials, reviews, ratings, press, benchmarks, customer logos, pricing.** None exist.
- **The eli5.ai domain** is planned but not owned. The share card currently says "Learn faster at eli5.ai"; nothing should present that domain as live until it is acquired. The live site is on Vercel.

## Product Principles

1. **Understanding over answers.** An explanation isn't finished until the learner can show they got it: analogy first, then a check.
2. **Meet the learner at their level, then let them climb.** The same topic should work at Child, Intermediate, and Expert, and moving between them should be effortless.
3. **Grounded, never invented.** Explanations cite real context, and the product itself makes no claim it can't back up.
4. **The demo is the pitch.** A first-time guest must reach a great answer within seconds: no sign-up wall, no dead ends, no broken states.
5. **Production-grade everywhere.** Evaluators judge engineering and craft together, so errors, empty states, edge cases, and deployment are part of the product.
