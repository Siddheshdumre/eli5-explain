
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import HeroSection from '@/components/HeroSection';
import QuestionForm from '@/components/QuestionForm';
import WikipediaSummary from '@/components/WikipediaSummary';
import AnswerDisplay from '@/components/AnswerDisplay';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-16 space-y-8">
        <QuestionForm
          question={question}
          setQuestion={setQuestion}
          isListening={isListening}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          format={format}
          setFormat={setFormat}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onStartListening={startListening}
          onStopListening={stopListening}
        />

        <WikipediaSummary summary={wikipediaSummary} />
        
        <AnswerDisplay answer={answer} onSpeak={speakAnswer} />
      </div>
    </div>
  );
};

export default Index;
