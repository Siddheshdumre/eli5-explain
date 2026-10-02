import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

// Chromium-only event, not in the standard DOM typings
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
}

/** Offers "Install app" only while the browser can actually install it (Chromium, not yet installed). */
export function InstallPWA({ className }: { className?: string }) {
    const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault();
            setPromptInstall(e as BeforeInstallPromptEvent);
        };
        const onInstalled = () => setPromptInstall(null);
        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    if (!promptInstall) return null;

    const onClick = async () => {
        await promptInstall.prompt();
        // The prompt can only be used once; the browser fires a fresh event if it becomes available again
        setPromptInstall(null);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            aria-label="Install app"
            className={cn("flex items-center gap-2 text-muted-foreground hover:text-foreground", className)}
        >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">Install app</span>
        </Button>
    );
}
