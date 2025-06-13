
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Brain, BookOpen, Search, Sparkles, Users, Zap } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <Brain className="h-16 w-16 text-blue-600" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ELI5.AI
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                  <div className="h-1 w-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded"></div>
                  <div className="h-1 w-2 bg-indigo-500 rounded"></div>
                </div>
              </div>
            </div>
            <p className="text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform complex topics into clear, engaging explanations tailored to your learning level
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Multiple difficulty levels</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <span>Voice interaction</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                <span>Wikipedia integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16 space-y-8">
        {/* Main Input Card */}
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
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button
                onClick={isListening ? stopListening : startListening}
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
              onClick={handleSubmit} 
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

        {/* Wikipedia Summary */}
        {wikipediaSummary && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                Background Information
              </CardTitle>
              <CardDescription className="text-gray-600">
                Context from Wikipedia to enhance your explanation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg">{wikipediaSummary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answer */}
        {answer && (
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
                  onClick={speakAnswer} 
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
        )}
      </div>
    </div>
  );
};

export default Index;
