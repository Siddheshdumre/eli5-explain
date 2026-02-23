import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark', // Using dark theme to match the UI better
    securityLevel: 'loose',
    suppressErrorRendering: true, // Crucial: prevents the "Syntax error bomb" from flashing
});

interface MermaidProps {
    chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        if (containerRef.current && chart) {
            const id = `mermaid-${Math.random().toString(36).substring(7)}`;
            mermaid.render(id, chart)
                .then(({ svg }) => {
                    if (isMounted && containerRef.current) {
                        containerRef.current.innerHTML = svg;
                    }
                })
                .catch((e) => {
                    // Suppress errors during streaming as syntax will be incomplete
                    if (isMounted && containerRef.current) {
                        containerRef.current.innerHTML = `
                        <div class="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground animate-pulse border border-dashed rounded-lg bg-muted/10 w-full">
                            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            <span>AI is drawing a diagram...</span>
                        </div>`;
                    }
                });
        }
        return () => {
            isMounted = false;
        };
    }, [chart]);

    return <div ref={containerRef} className="mermaid-diagram my-8 flex justify-center overflow-x-auto" />;
};
