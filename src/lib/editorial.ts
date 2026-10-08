import { cn } from "@/lib/utils";

/** Shared classes of the editorial world (see DESIGN.md): one ink focus ring, quiet links and controls. */

export const focusRing =
  "rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";

export const linkClass = cn(
  "underline decoration-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground",
  focusRing
);

/** Text links in the nav and footer: 40px tall so they are real touch targets. */
export const navLinkClass = cn("inline-flex min-h-10 items-center t-small font-medium", linkClass);

/** Icon controls (theme, install) in secondary ink with no hover fill. */
export const quietControl = "text-foreground/75 hover:bg-transparent hover:text-foreground";

/** Form inputs: 48px tall, sharp 1px edge at 3:1, text in the small role. */
export const fieldInputClass = "h-12 rounded-md border-input bg-transparent px-4 t-small placeholder:text-muted-foreground";
