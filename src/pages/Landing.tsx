import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InstallPWA } from "@/components/InstallPWA";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Inline, Rule, Wordmark } from "@/components/editorial";
import { focusRing, linkClass, navLinkClass, quietControl } from "@/lib/editorial";
import { useReveal } from "@/hooks/use-reveal";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { cn } from "@/lib/utils";

const GITHUB_URL = "https://github.com/Siddheshdumre/eli5-explain";

/*
 * Layout runs on two vertical rays from lg up: ray A is column 1, ray B is column 6 (both with a
 * +40px sub-ray for list text). Every text block starts on one of them. Below lg there is one ray.
 */

// Real ELI5.AI output (Standard format, Basic Wikipedia source): whole sentences from each level's answer.
const LEVELS = [
  {
    id: "child",
    label: "ELI5 (Child)",
    text: "Imagine a super‑deep sand pit at the playground. The sand pit is so deep that anything that gets close—balls, toys, even a flash of light—slides down and can’t climb out. The rim of the pit is called the **event horizon**; once you cross it, the pull of **gravity** drags you straight toward the bottom.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    text: "Imagine a city built on a steep, endless funnel that pulls every car, bike, and pedestrian toward its center the moment they cross the city limits. The **city limits** correspond to the **event horizon**, the invisible boundary beyond which the escape speed exceeds the speed of light, so nothing—not even light—can get out.",
  },
  {
    id: "expert",
    label: "Expert",
    text: "A black hole is a spacetime region where the **metric** becomes so strongly curved that all future‑directed **timelike** and **null geodesics** inevitably terminate inside. Any compact object that collapses beneath its own **Schwarzschild radius** will manifest as a black hole, with observable effects confined to horizon‑scale dynamics and emitted radiation.",
  },
] as const;

// Real Knowledge Check generated from the ELI5 (Child) answer, with the AI Tutor's real correction for each wrong pick.
const QUIZ = {
  question: "In the sand‑pit analogy, what does the “event horizon” represent?",
  options: ["The rim of the pit", "The bottom of the pit", "The sand itself", "The playground slide"],
  correct: "The rim of the pit",
  corrections: {
    "The bottom of the pit":
      "Your answer said the event horizon is the **bottom** of the pit, but the story tells us that the bottom is the *singularity*—the point where everything is squeezed. The event horizon is actually the **rim** of the pit, the line you cross before you start sliding down and can’t get back out. Great job thinking about it, and now you’ve got the right picture!",
    "The sand itself":
      "Your answer “the sand itself” describes what fills the pit, but the **event horizon** is the edge you cross before you fall in—just like the rim of a deep sand‑pit. The rim marks the point where the pull of gravity becomes so strong that nothing can climb back out, which is why “the rim of the pit” is the right answer. Great job thinking about the picture; you’re getting the idea of where the boundary is!",
    "The playground slide":
      "Your answer “playground slide” describes the steep side of the pit, not the edge where you first fall in—so it mixes up two different parts of the picture. The event horizon is actually the **rim of the pit**, the boundary you cross before the sand’s pull (gravity) drags you down forever. Great job thinking about the analogy; now you’ve got the right piece of the puzzle!",
  } as Record<string, string>,
};

// Real Agentic Web Search run: the searches the research agent made before answering.
const RESEARCH = {
  question: "What have astronomers recently learned about the black hole at the centre of the Milky Way?",
  searches: [
    "recent discoveries about the black hole at the centre of the Milky Way 2023 2024 astronomers learned",
    "2024 discovery wind outflow Sagittarius A* 2024",
  ],
};

const STACK = [
  ["Model", "gpt‑oss‑120b on Groq, streamed live"],
  ["Research", "LangGraph agent with Tavily search"],
  ["Quizzes", "Schema‑validated structured output"],
  ["Backend", "FastAPI on Vercel serverless"],
  ["Accounts", "Supabase Auth, row‑level security"],
  ["Frontend", "React, Vite, Tailwind; installable PWA"],
];

const delay = (index: number, step = 60) => ({ "--reveal-delay": `${index * step}ms` }) as CSSProperties;

function PrimaryCta() {
  return (
    <Button asChild variant="brand" size="cta">
      <Link to="/app">Ask your first question</Link>
    </Button>
  );
}

/** Section headline: the heading travels on its own parallax layer; its text slides up through a mask. */
function Headline({ children, className, size = "t-headline" }: { children: string; className?: string; size?: string }) {
  return (
    <h2 className={cn("parallax-rise", size, className)}>
      <span data-reveal="" className="block">
        {children}
      </span>
    </h2>
  );
}

function LevelSwitch() {
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    setActive(index);
    setInteracted(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = LEVELS.length - 1;
    const next =
      event.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : event.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <p className="t-title hang-quote">“How do black holes work?”</p>

      <div role="tablist" aria-label="Explanation level" onKeyDown={onKeyDown} className="-mx-2 mt-6 flex flex-wrap gap-x-4">
        {LEVELS.map((level, i) => (
          <button
            key={level.id}
            ref={(el) => (tabRefs.current[i] = el)}
            role="tab"
            id={`level-tab-${level.id}`}
            aria-selected={active === i}
            aria-controls={`level-panel-${level.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => select(i)}
            className={cn(
              // The selected bar is its own element so the rounded focus outline never bends it
              "relative h-12 px-2 t-small font-medium transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 lg:text-xl lg:leading-8",
              focusRing,
              active === i
                ? "text-foreground after:bg-foreground"
                : "text-foreground/75 after:bg-transparent hover:text-foreground"
            )}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Desktop: all answers share one grid cell so switching never shifts the page. Mobile: only the active one renders. */}
      <div className="mt-8 grid">
        {LEVELS.map((level, i) => (
          <div
            key={level.id}
            role="tabpanel"
            id={`level-panel-${level.id}`}
            aria-labelledby={`level-tab-${level.id}`}
            className={cn(
              "max-w-[44ch] lg:[grid-area:1/1]",
              active === i ? (interacted ? "level-in" : "") : "hidden lg:invisible lg:block"
            )}
          >
            <p className="t-lead">
              <Inline text={level.text} />
            </p>
            <p className="mt-6 t-small text-foreground/75">Real ELI5.AI output.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractiveQuiz() {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const correction = picked && picked !== QUIZ.correct ? QUIZ.corrections[picked] : null;

  return (
    <div>
      <p className="t-title">{QUIZ.question}</p>

      <div role="group" aria-label="Answer options" className="mt-8">
        <Rule heavy />
        {QUIZ.options.map((option, i) => {
          const isCorrect = option === QUIZ.correct;
          const isPicked = option === picked;
          const verdict = answered && isCorrect ? "Correct" : isPicked ? "Your pick" : null;
          return (
            <div key={option} data-reveal="" style={delay(i, 40)}>
              <button
                type="button"
                onClick={() => setPicked(option)}
                disabled={answered}
                aria-pressed={isPicked}
                className={cn(
                  "group grid w-full grid-cols-[2.5rem_1fr] items-baseline gap-y-1 py-4 text-left t-body sm:grid-cols-[2.5rem_1fr_auto] sm:gap-x-6",
                  focusRing,
                  answered && !isCorrect && !isPicked && "text-foreground/75"
                )}
              >
                <span
                  className={cn(
                    "font-medium tabular-nums transition-colors",
                    answered ? "text-foreground/75" : "text-foreground/75 group-hover:text-foreground"
                  )}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={cn("quiz-option-text", answered && isCorrect && "font-semibold")} data-struck={isPicked && !isCorrect}>
                  {option}
                </span>
                {verdict && (
                  <span className={cn("col-start-2 t-small sm:col-start-3 sm:text-right", isCorrect ? "font-semibold" : "text-foreground/75")}>
                    {verdict}
                  </span>
                )}
              </button>
              <Rule />
            </div>
          );
        })}
      </div>

      <p className="mt-4 t-small text-foreground/75">A real Knowledge Check, generated from the ELI5 (Child) answer above.</p>

      <div aria-live="polite">
        {answered && (
          <div className="reveal-in mt-12">
            {correction ? (
              <figure>
                <blockquote className="max-w-[48ch] t-body">
                  <Inline text={correction} />
                </blockquote>
                <figcaption className="mt-4 t-small font-medium text-foreground/75">AI Tutor Feedback</figcaption>
              </figure>
            ) : (
              <p className="t-body font-semibold">Correct! Great job retaining that information.</p>
            )}
            <button type="button" onClick={() => setPicked(null)} className={cn("mt-6 t-small font-medium", linkClass)}>
              Try another answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const Landing = () => {
  const root = useRef<HTMLDivElement>(null);
  useSmoothScroll();
  useReveal(root);

  return (
    <div
      ref={root}
      className="min-h-screen bg-background text-foreground"
      // Focus rings stay in ink: the accent is reserved for the primary call to action
      style={{ "--ring": "var(--foreground)" } as CSSProperties}
    >
      <div className="mx-auto max-w-[80rem] px-6 md:px-12">
        <header>
          <nav aria-label="Main" className="flex h-20 items-center justify-between gap-4">
            <Wordmark />
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle className={quietControl} />
              <InstallPWA className={quietControl} />
              <Link to="/login" className={navLinkClass}>
                Log in
              </Link>
            </div>
          </nav>
        </header>

        <main>
          {/* Hero: the pitch on ray A settles back as you scroll; the product proving it sits on ray B */}
          <section className="grid grid-cols-1 gap-x-12 gap-y-16 pb-20 pt-12 lg:grid-cols-12 lg:pb-32 lg:pt-24">
            <div className="scroll-recede lg:col-span-5">
              <h1 className="t-display">Explain anything, simply.</h1>
              <p className="mt-12 max-w-[30ch] t-body text-foreground/75">
                From “explain like I’m five” to expert, then a quiz to check it stuck.
              </p>
              <div className="mt-10">
                <PrimaryCta />
                <p className="mt-4 t-small text-foreground/75">5 free questions. No sign‑up.</p>
              </div>
            </div>

            <div className="lg:col-span-7 lg:col-start-6 lg:pt-2">
              <LevelSwitch />
            </div>
          </section>

          {/* Proof of understanding: the visitor takes the quiz */}
          <section className="grid grid-cols-1 gap-x-12 gap-y-12 py-20 lg:grid-cols-12 lg:py-32">
            <div className="lg:col-span-5">
              <Headline>Then it checks that you got it.</Headline>
              <p data-reveal="" className="mt-10 max-w-[30ch] t-body text-foreground/75">
                Try it. Pick an answer.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 lg:pt-3">
              <InteractiveQuiz />
            </div>
          </section>

          {/* Grounding: the research agent's log */}
          <section className="grid grid-cols-1 gap-x-12 gap-y-12 py-20 lg:grid-cols-12 lg:py-32">
            <div className="lg:col-span-5">
              <Headline>Answers that start from sources.</Headline>
              <p data-reveal="" className="mt-10 max-w-[30ch] t-body text-foreground/75">
                Wikipedia by default. A live research agent for anything recent.
              </p>
            </div>
            <div className="lg:col-span-7 lg:col-start-6 lg:pt-3">
              <p className="t-title hang-quote">“{RESEARCH.question}”</p>
              <p className="mt-8 t-small font-medium text-foreground/75">Searched:</p>
              <ol className="mt-4">
                <li aria-hidden="true">
                  <Rule heavy />
                </li>
                {RESEARCH.searches.map((query, i) => (
                  <li key={query}>
                    <div data-reveal="" style={delay(i)} className="grid grid-cols-[2.5rem_1fr] py-4 t-body">
                      <span className="font-medium tabular-nums text-foreground/75" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>“{query}”</span>
                    </div>
                    <Rule />
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* For evaluators: a ruled spec table, term on ray A, detail on ray B */}
          <section className="py-20 lg:py-32">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Headline>How it’s built</Headline>
              </div>
              <p data-reveal="" className="t-body text-foreground/75 lg:col-span-7 lg:col-start-6 lg:pt-3">
                A portfolio project by Siddhesh Dumre.{" "}
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={cn("text-foreground", linkClass)}>
                  Source on GitHub
                </a>
                .
              </p>
            </div>
            <dl className="mt-16">
              <Rule heavy />
              {STACK.map(([term, detail], i) => (
                <div key={term}>
                  <div
                    data-reveal=""
                    style={delay(i, 40)}
                    className="grid grid-cols-1 gap-x-12 gap-y-1 py-4 t-small sm:grid-cols-2 lg:grid-cols-12"
                  >
                    <dt className="font-semibold lg:col-span-5">{term}</dt>
                    <dd className="text-foreground/75 lg:col-span-7 lg:col-start-6">{detail}</dd>
                  </div>
                  <Rule />
                </div>
              ))}
            </dl>
          </section>

          {/* Close */}
          <section className="py-24 lg:py-40">
            <Headline size="t-display-2" className="max-w-[16ch]">
              Pick the topic you’ve been putting off.
            </Headline>
            <div className="mt-12">
              <PrimaryCta />
            </div>
          </section>
        </main>

        <footer className="pb-12">
          <Rule />
          <p className="pt-6 t-small text-foreground/75">© 2026 ELI5.AI</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
