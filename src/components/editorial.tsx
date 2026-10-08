import { Orbit } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { focusRing } from "@/lib/editorial";

/** Shared components of the editorial world (see DESIGN.md); shared classes live in lib/editorial. */

/** Sharp structural rule: 1px hairline, or a 2px ink rule to open a table. Draws in on entry. */
export function Rule({ heavy = false, className }: { heavy?: boolean; className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-reveal-rule=""
      className={cn(heavy ? "h-0.5 bg-foreground" : "h-px bg-foreground/25", className)}
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex min-h-10 items-center gap-2 text-lg font-extrabold tracking-[-0.02em]",
        focusRing,
        className
      )}
    >
      <Orbit className="h-5 w-5" aria-hidden="true" />
      ELI5.AI
    </Link>
  );
}

/** Renders the model's inline markdown emphasis (**bold**, *italic*) as plain elements. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**")) return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
