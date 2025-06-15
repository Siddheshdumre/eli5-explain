
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Volume2 } from "lucide-react";

interface AnswerDisplayProps {
  answer: string;
  onSpeak: () => void;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ answer, onSpeak }) => {
  if (!answer) return null;

  return (
    <Card className="shadow-2xl border border-gray-800 bg-gray-900/90 backdrop-blur-xl">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl text-white">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            Your Personalized Explanation
          </CardTitle>
          <Button 
            onClick={onSpeak} 
            variant="outline" 
            size="lg"
            className="border-2 border-purple-600/50 bg-gray-800 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Volume2 className="h-5 w-5 mr-2" />
            Listen
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Tailored to your selected difficulty level and format preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line bg-gradient-to-r from-gray-800/50 to-slate-800/50 p-6 rounded-xl border border-gray-700">
            {answer}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerDisplay;
