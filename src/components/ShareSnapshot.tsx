import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { quietControl } from '@/lib/editorial';

interface ShareSnapshotProps {
    explanation: string;
    question: string;
    difficulty: string;
}

/** Model output is markdown; the card shows it as plain text (never as HTML). */
function toPlainText(markdown: string) {
    return markdown
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> their text
        .replace(/[*_`#>]+/g, '') // emphasis, code, headings, quotes
        .replace(/\s+/g, ' ')
        .trim();
}

/** Keeps whole sentences up to the limit, so the card never ends mid-thought. */
function wholeSentences(text: string, limit: number) {
    const sentences = text.match(/[^.!?]+[.!?]+["”’)]*\s*/g) ?? [text];
    let out = '';
    for (const sentence of sentences) {
        if ((out + sentence).length > limit) break;
        out += sentence;
    }
    // A single sentence longer than the limit: cut at a word boundary and say so
    return out.trim() || text.slice(0, limit).replace(/\s+\S*$/, '') + '…';
}

export function ShareSnapshot({ explanation, question, difficulty }: ShareSnapshotProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const hiddenRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!hiddenRef.current) return;
        setIsGenerating(true);

        try {
            // Let fonts settle before capture
            await document.fonts.ready;

            const canvas = await html2canvas(hiddenRef.current, {
                scale: 2, // High DPI capture
                backgroundColor: getComputedStyle(document.body).backgroundColor, // The card follows the current theme
                useCORS: true,
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `eli5-explanation-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        } catch (err) {
            console.error("Snapshot failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const body = wholeSentences(toPlainText(explanation), 420);
    const title = wholeSentences(toPlainText(question), 140);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                disabled={isGenerating}
                aria-label={isGenerating ? "Exporting image" : "Export as image"}
                title="Export as image"
                className={quietControl}
            >
                <Share2 className="h-4 w-4" aria-hidden="true" />
            </Button>

            {/* Off-screen 1080×1080 card, set like a printed page in the current theme */}
            <div
                ref={hiddenRef}
                aria-hidden="true"
                style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "1080px", height: "1080px" }}
                className="flex flex-col bg-background p-24 text-foreground"
            >
                <div className="flex items-baseline justify-between">
                    <p className="text-[32px] font-extrabold tracking-[-0.02em]">ELI5.AI</p>
                    <p className="text-[24px] font-medium opacity-75">{difficulty}</p>
                </div>
                <div className="mt-6 h-0.5 w-full bg-foreground" />

                <p className="mt-16 text-[56px] font-extrabold leading-[60px] tracking-[-0.03em]">{title}</p>
                <p className="mt-12 text-[32px] leading-[48px]">{body}</p>

                <div className="mt-auto">
                    <div className="h-px w-full bg-foreground/25" />
                    <p className="pt-6 text-[24px] font-medium opacity-75">{window.location.host}</p>
                </div>
            </div>
        </>
    );
}
