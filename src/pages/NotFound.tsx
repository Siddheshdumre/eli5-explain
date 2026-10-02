import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wordmark } from "@/components/editorial";
import { quietControl } from "@/lib/editorial";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[80rem] px-6 md:px-12">
        <header className="flex h-20 items-center justify-between gap-4">
          <Wordmark />
          <ThemeToggle className={quietControl} />
        </header>
        <main className="grid grid-cols-1 gap-x-12 pb-24 pt-12 lg:grid-cols-12 lg:pt-24">
          <div className="lg:col-span-7">
            <p className="t-display tabular-nums">404</p>
            <h1 className="mt-12 t-headline">This page doesn’t exist.</h1>
            <p className="mt-10 max-w-[40ch] t-body text-foreground/75">
              Nothing lives at <span className="font-medium text-foreground">{location.pathname}</span>.
            </p>
            <div className="mt-12">
              <Button asChild variant="brand" size="cta">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound;
