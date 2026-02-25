import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(true);
    const [promptInstall, setPromptInstall] = useState<any>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("transitionend", handler);
    }, []);

    const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
    };

    // Removed `if (!supportsPWA) return null;` so the button always renders visually.
    return (
        <Button
            variant="outline"
            size="sm"
            className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 border-cyan-500/20 shadow-[0_0_10px_rgba(0,245,255,0.1)] transition-all flex items-center gap-2"
            onClick={onClick}
            title={promptInstall ? "Install App" : "App installation not yet ready or already installed"}
            disabled={!promptInstall}
        >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Install App</span>
        </Button>
    );
}
