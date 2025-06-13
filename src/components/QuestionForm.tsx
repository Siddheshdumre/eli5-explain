
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Search, Brain } from "lucide-react";

interface QuestionFormProps {
  question: string;
  setQuestion: (question: string) => void;
  isListening: boolean;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  format: string;
  setFormat: (format: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  setQuestion,
  isListening,
  difficulty,
  setDifficulty,
  format,
  setFormat,
  isLoading,
  onSubmit,
  onStartListening,
  onStopListening,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          Ask Your Question
        </CardTitle>
        <CardDescription className="text-gray-600 text-lg">
          Type your question or use voice input to get a personalized explanation
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="flex gap-3">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What would you like to understand today?"
            className="flex-1 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors"
            onKeyPress={handleKeyPress}
          />
          <Button
            onClick={isListening ? onStopListening : onStartListening}
            variant={isListening ? "destructive" : "outline"}
            size="lg"
            className="h-14 w-14 border-2"
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="difficulty" className="text-lg font-semibold text-gray-700">
              Difficulty Level
            </Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eli5">🧒 ELI5 (Child-friendly)</SelectItem>
                <SelectItem value="intermediate">🎓 Intermediate (Teenager)</SelectItem>
                <SelectItem value="expert">👨‍🎓 Expert (Graduate level)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="format" className="text-lg font-semibold text-gray-700">
              Answer Style
            </Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">📝 Standard explanation</SelectItem>
                <SelectItem value="storytelling">📚 Storytelling with analogies</SelectItem>
                <SelectItem value="technical">⚙️ Technical breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={onSubmit} 
          disabled={isLoading} 
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating your explanation...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5" />
              Get Explanation
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
