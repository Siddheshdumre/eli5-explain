
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Brain, BookOpen, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [question, setQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [difficulty, setDifficulty] = useState('eli5');
  const [format, setFormat] = useState('standard');
  const [answer, setAnswer] = useState('');
  const [wikipediaSummary, setWikipediaSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        toast({
          title: "Voice input received",
          description: `You said: "${transcript}"`,
        });
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice input error",
          description: "Could not understand audio. Please try again.",
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [toast]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
      toast({
        title: "Listening...",
        description: "Speak your question now",
      });
    } else {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const speakAnswer = () => {
    if ('speechSynthesis' in window && answer) {
      const utterance = new SpeechSynthesisUtterance(answer);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      toast({
        title: "Speaking answer",
        description: "Audio playback started",
      });
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support speech synthesis",
        variant: "destructive",
      });
    }
  };

  const fetchWikipediaSummary = async (query: string): Promise<string> => {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data.extract || "No summary available.";
      }
    } catch (error) {
      console.error('Wikipedia fetch error:', error);
    }
    return "Unable to fetch Wikipedia summary.";
  };

  const generateAnswer = async (question: string, context: string, level: string, style: string): Promise<string> => {
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const levels = {
      'eli5': 'like you\'re explaining to a 5-year-old child',
      'intermediate': 'like you\'re teaching a teenager',
      'expert': 'like you\'re a professor explaining to graduate students'
    };

    const styles = {
      'standard': '',
      'storytelling': ' Use analogies and make it like a fun story.',
      'technical': ' Break it down into technical bullet points.'
    };

    return `Here's an explanation ${levels[level as keyof typeof levels]}${styles[style as keyof typeof styles]}

${question} is a fascinating topic! Based on the context: ${context.substring(0, 100)}...

This is a simulated AI response that would normally come from a language model like Mistral or GPT-4. In a full implementation, this would integrate with actual AI APIs to provide intelligent, contextual explanations at the requested difficulty level.

The explanation would be tailored to the ${level} level and formatted in a ${style} style, providing accurate and helpful information based on the Wikipedia context and the user's specific question.`;
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        description: "Type or speak your question to get an explanation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch Wikipedia summary
      const summary = await fetchWikipediaSummary(question);
      setWikipediaSummary(summary);

      // Generate AI answer
      const aiAnswer = await generateAnswer(question, summary, difficulty, format);
      setAnswer(aiAnswer);

      toast({
        title: "Answer generated!",
        description: "Your explanation is ready",
      });
    } catch (error) {
      console.error('Error generating answer:', error);
      toast({
        title: "Error",
        description: "Failed to generate answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ELI5.AI
            </h1>
          </div>
          <p className="text-xl text-gray-600">Explain anything at different difficulty levels</p>
        </div>

        {/* Main Input Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Ask Your Question
            </CardTitle>
            <CardDescription>
              Type your question or use voice input to get an explanation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eli5">ELI5 (Child)</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Answer Style</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="storytelling">Storytelling</SelectItem>
                    <SelectItem value="technical">Technical Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? "Generating Answer..." : "Get Explanation"}
            </Button>
          </CardContent>
        </Card>

        {/* Wikipedia Summary */}
        {wikipediaSummary && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Background Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{wikipediaSummary}</p>
            </CardContent>
          </Card>
        )}

        {/* Answer */}
        {answer && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Your Explanation
                </div>
                <Button onClick={speakAnswer} variant="outline" size="sm">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Speak Answer
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{answer}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
