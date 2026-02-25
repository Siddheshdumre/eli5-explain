import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Orbit, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ShareSnapshotProps {
    explanation: string;
    question: string;
    difficulty: string;
}

export function ShareSnapshot({ explanation, question, difficulty }: ShareSnapshotProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const hiddenRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!hiddenRef.current) return;
        setIsGenerating(true);

        try {
            // 1. Wait for images/fonts to load (basic delay to be safe)
            await new Promise((resolve) => setTimeout(resolve, 100));

            // 2. Capture the hidden div
            const canvas = await html2canvas(hiddenRef.current, {
                scale: 2, // High DPI capture
                backgroundColor: '#050505', // Force dark background
                useCORS: true, // Allow loading external images if needed
                logging: false,
            });

            // 3. Convert to blob/url
            const image = canvas.toDataURL("image/png", 1.0);

            // 4. Trigger download
            const link = document.createElement('a');
            link.download = `eli5-explanation-${Date.now()}.png`;
            link.href = image;
            link.click();

        } catch (err) {
            console.error("Snapshot failed:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {/* Visible Trigger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                disabled={isGenerating}
                className="text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                title="Export as Image"
            >
                {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Share2 className="h-4 w-4" />
                )}
            </Button>

            {/* Hidden High-Res Template (Rendered off-screen but in DOM) */}
            <div
                style={{
                    position: "fixed",
                    top: "-9999px",
                    left: "-9999px",
                    width: "1080px",
                    height: "1080px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
                ref={hiddenRef}
            >
                {/* Container with Gradient Border */}
                <div className="w-full h-full bg-[#050505] p-12 flex flex-col relative overflow-hidden text-slate-200 font-sans selection:bg-cyan-500/30">

                    {/* Background Effects */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                                <Orbit className="w-10 h-10 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-widest">ELI5.AI</h1>
                                <p className="text-cyan-400 font-medium tracking-wide uppercase text-sm">Explain Like I'm 5</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 font-medium">
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        {/* Question Badge */}
                        <div className="mb-8">
                            <span className="inline-block px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 text-lg border border-slate-700/50 mb-4">
                                Question
                            </span>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                {question.length > 120 ? question.substring(0, 120) + "..." : question}
                            </h2>
                        </div>

                        {/* Divider */}
                        <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-8"></div>

                        {/* Explanation */}
                        <div
                            className="text-3xl text-slate-300 leading-relaxed font-light"
                            // We limit text length to ensure it fits in the square 
                            dangerouslySetInnerHTML={{ __html: explanation.substring(0, 600) + (explanation.length > 600 ? "..." : "") }}
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center relative z-10">
                        <div className="text-slate-500 text-xl">
                            Learn faster at <span className="text-cyan-400 font-semibold">eli5.ai</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-cyan-500/20 border border-cyan-500"></div>
                            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></div>
                            <div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500"></div>
                        </div>
                    </div>

                    {/* Thick Gradient Border */}
                    <div className="absolute inset-0 border-[16px] border-slate-900 pointer-events-none"></div>

                </div>
            </div>
        </>
    );
}
