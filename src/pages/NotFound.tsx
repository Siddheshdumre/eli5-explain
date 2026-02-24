import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Orbit, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20"></div>
          <Orbit className="h-10 w-10 text-cyan-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
          404
        </h1>

        <h2 className="text-2xl font-semibold text-white mb-4">
          Lost in the Void
        </h2>

        <p className="text-slate-400 mb-10 leading-relaxed font-light">
          The concept you are looking for does not exist in our universe. It might have been moved, deleted, or swallowed by a black hole.
        </p>

        <Link to="/">
          <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold tracking-wide rounded border-none shadow-[0_0_15px_rgba(0,245,255,0.15)] group h-12 px-8">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Return to Home Base
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
