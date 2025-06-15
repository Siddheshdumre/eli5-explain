import { Toaster } from "@/components/ui/toaster";
import { ELI5Question } from "@/components/ELI5Question";

export default function AppPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">
        <ELI5Question />
      </main>
      <Toaster />
    </div>
  );
}
