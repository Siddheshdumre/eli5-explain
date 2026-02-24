import React from 'react';
import { Orbit } from 'lucide-react';

export const LoadingScreen = ({ message = "Loading universe..." }: { message?: string }) => {
    return (
        <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center absolute inset-0 z-50 overflow-hidden">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            {/* Center Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-900/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center w-16 h-16">
                    <Orbit className="w-10 h-10 text-cyan-400 animate-spin absolute" style={{ animationDuration: '3s' }} strokeWidth={1.5} />
                    <div className="w-3 h-3 bg-cyan-300 rounded-full animate-pulse shadow-[0_0_15px_rgba(0,245,255,0.8)]"></div>
                </div>

                <p className="text-cyan-400/80 text-sm tracking-[0.2em] uppercase font-medium animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
