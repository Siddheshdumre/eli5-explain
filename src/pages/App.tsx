import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ELI5Question } from "@/components/ELI5Question";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function AppPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate('/login');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Auth Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 hidden md:block">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <User className="h-4 w-4" />
            {session?.user?.email}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      {/* Mobile Header (simplified) */}
      <div className="md:hidden flex justify-end p-2 absolute top-0 right-0 z-10 w-full">
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <main className="py-8">
        <ELI5Question />
      </main>
      <Toaster />
    </div>
  );
}
