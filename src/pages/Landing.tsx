import React from 'react';
import { Button } from "@/components/ui/button";
import { Orbit, Database, Cpu, BrainCircuit, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-cyan-500/30">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Navigation */}
      <nav className="fixed w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Orbit className="h-6 w-6 text-cyan-400" />
              <span className="text-xl font-bold tracking-widest text-white">ELI5</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white text-sm tracking-wide">
                  Log in
                </Button>
              </Link>
              <Link to="/app">
                <Button className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold tracking-wide rounded">
                  Try for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden min-h-[90vh] flex items-center">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left Copy */}
            <div className="text-left w-full max-w-xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 text-xs font-medium tracking-wide mb-8">
                <Zap className="h-3 w-3" /> AI-Powered Learning
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight leading-[1.1]">
                Explain Anything
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500">
                  Simply & Clearly.
                </span>
              </h1>

              <p className="text-lg text-slate-400 mb-10 font-light leading-relaxed">
                Break down the most complex topics into easy-to-understand analogies. Choose your difficulty, ask a question, and learn instantly with state-of-the-art AI.
              </p>

              <div className="flex items-center gap-4">
                <Link to="/app">
                  <Button size="lg" className="h-12 px-8 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold tracking-wide rounded border-none shadow-[0_0_15px_rgba(0,245,255,0.15)] transition-all hover:shadow-[0_0_25px_rgba(0,245,255,0.3)]">
                    Try for Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side UI Mockup */}
            <div className="w-full max-w-lg mx-auto lg:max-w-none relative mt-12 lg:mt-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50"></div>

              <div className="relative bg-[#0a0a0c] border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-left flex flex-col h-[400px]">
                {/* Mockup Window Header */}
                <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-[#0f0f12]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  </div>
                  <div className="flex-1"></div>
                </div>

                {/* Mockup Window Content */}
                <div className="p-6 space-y-6 flex-1 overflow-hidden relative">
                  <div className="flex justify-end">
                    <div className="bg-cyan-950/30 border border-cyan-900/50 text-cyan-100 px-4 py-3 rounded-lg max-w-[85%] text-sm shadow-sm">
                      How exactly do black holes work?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#111113] border border-slate-800 text-slate-300 px-5 py-4 rounded-lg max-w-[90%] text-sm leading-relaxed shadow-sm">
                      <span className="text-cyan-400 font-medium mb-2 flex items-center gap-2"><Orbit className="w-3.5 h-3.5" /> ELI5 Active</span>
                      Imagine space is a giant trampoline. If you place a heavy bowling ball in the middle, it sinks down and creates a massive dip. Now imagine placing a ball so incredibly heavy that it tears a hole right through the fabric...
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Narrative Feature Layout (Alternating full width) */}
      <section className="py-24 border-y border-slate-800 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-[400px] border border-slate-800 bg-[#0a0a0a] rounded-lg relative overflow-hidden flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 to-transparent"></div>
                <Cpu className="h-24 w-24 text-slate-700 mx-auto" strokeWidth={1} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center p-2 bg-cyan-500/10 rounded-md mb-6">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Adjustable Difficulty Levels</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Not everyone learns the same way. Switch instantly between simplified child-like analogies, intermediate teenage summaries, or full expert deep-dives. The AI adapts its vocabulary to your exact needs in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Feature 2 */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center p-2 bg-blue-500/10 rounded-md mb-6">
                <BrainCircuit className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Interactive Socrates Quizzes</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Don't just read—prove you understand. Toggle standard explanations into interactive learning quizzes. If you get an answer wrong, the system politely tutors you on exactly where your logic broke down.
              </p>
            </div>
            <div>
              <div className="w-full h-[400px] border border-slate-800 bg-[#0a0a0a] rounded-lg relative overflow-hidden flex flex-col justify-center p-8 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent"></div>
                <div className="bg-[#111113] border border-slate-800 rounded p-4 mb-4 relative z-10 w-full max-w-sm mx-auto shadow-xl">
                  <p className="text-slate-200 font-medium mb-4">Which of the following best describes gravity?</p>
                  <div className="space-y-3">
                    <div className="w-full bg-[#1a1a20] border border-slate-700/50 rounded p-3 text-sm text-slate-400 flex items-center gap-2"><div className="w-3 h-3 rounded-full border border-slate-600"></div>A pulling force caused by magnets</div>
                    <div className="w-full bg-[#1f1a1a] border-l-2 border-l-red-500 border-slate-700/50 rounded p-3 text-sm text-red-300 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>Energy waves</div>
                    <div className="w-full bg-cyan-950/40 border-l-2 border-l-cyan-500 rounded p-3 text-sm text-cyan-50 flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500"></div>Space curving by heavy objects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Feature 3 */}
      <section className="py-24 border-y border-slate-800 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-[400px] border border-slate-800 bg-[#0a0a0a] rounded-lg relative overflow-hidden flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 to-transparent"></div>
                <Database className="h-24 w-24 text-slate-700 mx-auto" strokeWidth={1} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center p-2 bg-cyan-500/10 rounded-md mb-6">
                <Database className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Grounded in Reality</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Connected directly to Wikipedia and live search agents. ELI5 pulls hard factual context before answering, ensuring its explanations are always rooted in accurate, real-world data instead of AI hallucinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-32 relative text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Learning Faster Today
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join thousands of learners and decode the universe's most complex topics instantly.
          </p>
          <div className="flex justify-center">
            <Link to="/app">
              <Button size="lg" className="h-12 px-8 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold tracking-wide rounded border-none">
                Try for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#020202] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-bold tracking-widest text-slate-500">ELI5.AI</span>
          </div>
          <p className="mb-2">&copy; 2025 ELI5 Universe Builder. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
