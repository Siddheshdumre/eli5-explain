
import React from 'react';
import { Brain, BookOpen, Users, Zap, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Brain className="h-16 w-16 text-blue-400" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                ELI5.AI
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                <div className="h-1 w-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded"></div>
                <div className="h-1 w-2 bg-indigo-500 rounded"></div>
              </div>
            </div>
          </div>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform complex topics into clear, engaging explanations tailored to your learning level
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span>Multiple difficulty levels</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span>Voice interaction</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <span>Wikipedia integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
