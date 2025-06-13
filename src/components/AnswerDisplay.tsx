
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
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            Your Personalized Explanation
          </CardTitle>
          <Button 
            onClick={onSpeak} 
            variant="outline" 
            size="lg"
            className="border-2 border-purple-200 hover:bg-purple-50 transition-colors"
          >
            <Volume2 className="h-5 w-5 mr-2 text-purple-600" />
            Listen
          </Button>
        </div>
        <CardDescription className="text-gray-600">
          Tailored to your selected difficulty level and format preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-800 leading-relaxed text-lg whitespace-pre-line bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
            {answer}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerDisplay;
