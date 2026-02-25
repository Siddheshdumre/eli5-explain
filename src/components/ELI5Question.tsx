import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Quiz, QuizData } from "./Quiz";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Loader2, Brain, Sparkles, Cpu, Send } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ShareSnapshot } from "./ShareSnapshot";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export function ELI5Question({ threadId }: { threadId?: string }) {
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("ELI5 (Child)");
  const [format, setFormat] = useState("Standard");
  const [contextSource, setContextSource] = useState("wikipedia");
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [enableSocrates, setEnableSocrates] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, quizData, quizLoading]);

  // Load History when threadId changes
  useEffect(() => {
    if (threadId) {
      loadHistory(threadId);
    } else {
      setMessages([]);
      setQuizData(null);
    }
  }, [threadId]);

  const loadHistory = async (id: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`/api/threads/${id}/messages`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (answerText: string, diff: string) => {
    setQuizLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authHeader = session ? `Bearer ${session.access_token}` : "Bearer null";

      const res = await fetch(`/api/generate_quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          answer_text: answerText,
          difficulty: diff,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      }
    } catch (err) {
      console.error("Failed to generate quiz", err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const { data: { session } } = await supabase.auth.getSession();

    // Check free limit
    let usageCount = parseInt(localStorage.getItem('eli5_free_usage') || '0');
    if (!session && usageCount >= 5) {
      toast({
        title: "Free Trial Ended",
        description: "You've used your 5 free questions. Please create an account to unlock unlimited access and save your history.",
        variant: "default",
      });
      navigate('/signup');
      return;
    }

    const userMsg = question.trim();
    setQuestion("");
    setQuizData(null);
    setLoading(true);

    // Optimistically add user message and empty assistant placeholder
    const tempUserMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userMsg };
    const tempAsstMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: "" };

    setMessages(prev => [...prev, tempUserMsg, tempAsstMsg]);

    try {
      const authHeader = session ? `Bearer ${session.access_token}` : "Bearer null";

      if (!session) {
        usageCount++;
        localStorage.setItem('eli5_free_usage', usageCount.toString());
      }

      const res = await fetch(`/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify({
          question: userMsg,
          difficulty,
          format_option: format,
          context_source: contextSource,
          thread_id: threadId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream available");

      const decoder = new TextDecoder();
      let buffer = "";
      let currentAnswer = "";
      let isFirstNewThread = false;
      let newThreadId = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const dataStr = part.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const payload = JSON.parse(dataStr);
              if (payload.type === 'thread_id') {
                if (!threadId) {
                  isFirstNewThread = true;
                  newThreadId = payload.content;
                }
              } else if (payload.type === 'chunk') {
                currentAnswer += payload.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: currentAnswer };
                  return newMsgs;
                });
                await new Promise(resolve => setTimeout(resolve, 15));
              } else if (payload.type === 'error') {
                throw new Error(payload.content);
              }
            } catch (err) {
              console.error("Error parsing stream payload:", err);
            }
          }
        }
      }

      if (currentAnswer.length > 50 && enableSocrates) {
        generateQuiz(currentAnswer, difficulty);
      }

      if (isFirstNewThread && newThreadId) {
        navigate(`/app/${newThreadId}`, { replace: true });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response.",
        variant: "destructive",
      });
      // Try to determine if we should remove the optimistic messages
      setMessages(prev => {
        // If the last message is assistant and its content is completely empty, it means we failed before receiving anything.
        if (prev.length >= 2 && prev[prev.length - 1].role === 'assistant' && !prev[prev.length - 1].content) {
          return prev.slice(0, prev.length - 2);
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto relative rounded-xl bg-background/50 border shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Settings Header pinned to top */}
      <div className="border-b bg-card/95 backdrop-blur-sm shrink-0 z-10 px-4 py-3">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3">

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="h-8 text-xs bg-muted/50">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELI5 (Child)">ELI5 (Child)</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="h-8 text-xs bg-muted/50">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Storytelling">Storytelling</SelectItem>
                <SelectItem value="Technical Breakdown">Tech Breakdown</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contextSource} onValueChange={setContextSource}>
              <SelectTrigger className="h-8 text-xs bg-muted/50">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wikipedia">Basic Wikipedia</SelectItem>
                <SelectItem value="advanced_web_search">Agentic Web Search</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 pl-2 border-l border-muted">
              <Switch id="socrates-mode" checked={enableSocrates} onCheckedChange={setEnableSocrates} />
              <Label htmlFor="socrates-mode" className="text-xs font-semibold whitespace-nowrap cursor-pointer">Socrates Quiz</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-28 min-h-0">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
            <Sparkles className="h-12 w-12 mb-4" />
            <h2 className="text-xl font-medium">Start a new explanation</h2>
            <p className="text-sm text-center max-w-sm mt-2">Adjust your difficulty and style settings above, then ask a question below to begin tracking your thread.</p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={m.id || idx} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border shadow-sm rounded-bl-sm'}`}>
              {m.role === 'assistant' && (
                <div className="flex items-center justify-between mb-2 text-primary font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Socrates
                  </div>
                  {m.content && (
                    <ShareSnapshot
                      explanation={m.content}
                      question={messages[idx - 1]?.content || "ELI5 Explanation"}
                      difficulty={difficulty}
                    />
                  )}
                </div>
              )}
              <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : ''}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
                {m.role === 'assistant' && !m.content && loading && idx === messages.length - 1 && (
                  <span className="flex items-center gap-2 text-muted-foreground animate-pulse mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Render Quiz below the last assistant message if available */}
        {quizData && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pt-4 flex justify-start">
            <div className="max-w-[85%] md:max-w-[75%]">
              <Quiz data={quizData} originalContext={messages[messages.length - 1].content} difficulty={difficulty} />
            </div>
          </div>
        )}
        {quizLoading && (
          <div className="flex flex-col items-start justify-center text-muted-foreground animate-pulse max-w-[85%] md:max-w-[75%] bg-card border shadow-sm rounded-2xl rounded-bl-sm px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4" />
              <p className="text-sm font-medium">Formulating Quiz...</p>
            </div>
          </div>
        )}

        <div ref={endOfMessagesRef} className="h-1 w-full shrink-0" />
      </div>

      {/* Input Form at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pt-10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center shadow-lg border rounded-full bg-card overflow-hidden focus-within:ring-1 focus-within:ring-primary">
            <Input
              placeholder="Ask a follow-up question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border-0 focus-visible:ring-0 h-14 pl-6 pr-14 text-base bg-transparent shadow-none"
              disabled={loading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !question.trim()}
              className="absolute right-2 rounded-full h-10 w-10 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <div className="text-center mt-2 text-[10px] text-muted-foreground hidden sm:block">
            AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}