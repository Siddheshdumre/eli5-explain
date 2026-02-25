import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ELI5Question } from "@/components/ELI5Question";
import { supabase } from "@/lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { InstallPWA } from "@/components/InstallPWA";

export default function AppPage() {
  const [session, setSession] = useState<any>(null);
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

  if (loading) return <LoadingScreen message="Connecting to ELI5 nodes..." />;

  return (
    <SidebarProvider>
      <AppSidebar currentThreadId={threadId} />
      <div className="flex w-full flex-col min-h-screen bg-background">
        {/* Auth Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 w-full flex items-center px-4 h-14 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Button variant="ghost" size="sm" onClick={() => session ? navigate('/profile') : navigate('/login')} className="text-muted-foreground hover:text-foreground hidden md:flex">
              <User className="h-4 w-4 mr-2" />
              {session ? `Hello, ${session?.user?.email}` : "Guest User (Free Trial)"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => session ? navigate('/profile') : navigate('/login')} className="md:hidden">
              <User className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <InstallPWA />
            {session ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground hidden md:flex">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="md:hidden">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="hidden md:flex bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 border-cyan-500/20 transition-colors">
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')} className="hidden md:flex bg-cyan-500 hover:bg-cyan-400 text-black font-semibold border-none transition-colors">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-muted/10 p-4">
          <ELI5Question threadId={threadId} />
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}
