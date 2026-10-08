import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { User } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { ELI5Question } from "@/components/ELI5Question";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { InstallPWA } from "@/components/InstallPWA";
import { ThemeToggle } from "@/components/ThemeToggle";
import { navLinkClass, quietControl } from "@/lib/editorial";
import { cn } from "@/lib/utils";

export default function AppPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { threadId } = useParams<{ threadId: string }>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <LoadingScreen />;

  const account = session ? session.user.email : "Guest · free trial";

  return (
    <SidebarProvider>
      <AppSidebar currentThreadId={threadId} signedIn={!!session} />
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-14 w-full shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className={quietControl} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (session ? navigate('/profile') : navigate('/login'))}
              className={cn("hidden min-w-0 t-small md:inline-flex", quietControl)}
            >
              <span className="truncate">{account}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={session ? "Profile" : "Log in"}
              onClick={() => (session ? navigate('/profile') : navigate('/login'))}
              className={cn("md:hidden", quietControl)}
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle className={quietControl} />
            <InstallPWA className={quietControl} />
            {session ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className={cn("t-small", quietControl)}>
                Sign out
              </Button>
            ) : (
              <>
                <Link to="/login" className={navLinkClass}>
                  Log in
                </Link>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="min-h-0 flex-1">
          <ELI5Question threadId={threadId} />
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
