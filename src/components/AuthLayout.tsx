import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wordmark } from "@/components/editorial";
import { quietControl } from "@/lib/editorial";

/** Account pages: statement on ray A, form on ray B, same editorial world as the landing page. */
export function AuthLayout({ title, lede, aside, children }: { title: string; lede: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[80rem] px-6 md:px-12">
        <header className="flex h-20 items-center justify-between gap-4">
          <Wordmark />
          <ThemeToggle className={quietControl} />
        </header>
        <main className="grid grid-cols-1 gap-x-12 gap-y-12 pb-24 pt-12 lg:grid-cols-12 lg:pt-24">
          <div className="lg:col-span-5">
            <h1 className="t-headline">{title}</h1>
            <p className="mt-10 max-w-[30ch] t-body text-foreground/75">{lede}</p>
            {aside}
          </div>
          <div className="lg:col-span-5 lg:col-start-6 lg:pt-3">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** A labelled field: the label sits on the same ray as its input, never beside or floating inside it. */
export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block t-small font-medium">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
