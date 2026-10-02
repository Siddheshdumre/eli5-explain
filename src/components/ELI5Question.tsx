import { useState, useEffect, useRef, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Quiz, QuizData } from "./Quiz";
import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ShareSnapshot } from "./ShareSnapshot";
import { Rule } from "./editorial";
import { fieldInputClass, focusRing } from "@/lib/editorial";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

// Starter questions for an empty conversation; picking one fills the input
const EXAMPLES = ["How do black holes work?", "Why is the sky blue?", "What does a central bank do?"];

// Settings bar selects: a label and a borderless trigger on one line
const settingTrigger =
  "h-10 w-auto gap-2 border-0 bg-transparent px-2 t-small font-medium shadow-none focus:ring-2 focus:ring-ring focus:ring-offset-0";

function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      <span className="t-label text-muted-foreground">{label}</span>
      {children}
    </div>
  );
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch(apiUrl(`/api/threads/${id}/messages`), {
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

      const res = await fetch(apiUrl(`/api/generate_quiz`), {
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

      const res = await fetch(apiUrl(`/api/ask`), {
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

            let payload;
            try {
              payload = JSON.parse(dataStr);
            } catch (err) {
              console.error("Error parsing stream payload:", err);
              continue;
            }

            // Backend errors (e.g. missing API key) must reach the outer catch so the user sees a toast
            if (payload.type === 'error') {
              throw new Error(payload.content);
            } else if (payload.type === 'thread_id') {
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

  const pickExample = (example: string) => {
    setQuestion(example);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 3.5rem)' }}>
      {/* Settings: one ruled bar */}
      <div className="shrink-0 border-b">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 md:px-6">
          <Setting label="Level">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger aria-label="Level" className={settingTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELI5 (Child)">ELI5 (Child)</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </Setting>
          <Setting label="Format">
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger aria-label="Format" className={settingTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Storytelling">Storytelling</SelectItem>
                <SelectItem value="Technical Breakdown">Technical Breakdown</SelectItem>
              </SelectContent>
            </Select>
          </Setting>
          <Setting label="Source">
            <Select value={contextSource} onValueChange={setContextSource}>
              <SelectTrigger aria-label="Source" className={settingTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wikipedia">Basic Wikipedia</SelectItem>
                <SelectItem value="advanced_web_search">Agentic Web Search</SelectItem>
              </SelectContent>
            </Select>
          </Setting>
          <div className="flex h-10 items-center gap-2">
            <Switch id="socrates-mode" checked={enableSocrates} onCheckedChange={setEnableSocrates} />
            <Label htmlFor="socrates-mode" className="cursor-pointer t-small font-medium">Socrates Quiz</Label>
          </div>
        </div>
      </div>

      {/* Conversation, set like a printed Q&A */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 md:px-6">
          {messages.length === 0 && !loading && (
            <div>
              <h2 className="t-headline">Ask anything.</h2>
              <p className="mt-8 max-w-[40ch] t-body text-foreground/75">
                Pick a level above, then ask below. Answers stream in as they’re written.
              </p>
              <p className="mt-10 t-label font-medium text-muted-foreground">Try one:</p>
              <ul className="mt-3 max-w-xl">
                <li aria-hidden="true">
                  <Rule heavy />
                </li>
                {EXAMPLES.map((example) => (
                  <li key={example}>
                    <button
                      type="button"
                      onClick={() => pickExample(example)}
                      className={cn("w-full py-4 text-left t-body transition-colors hover:text-foreground/75", focusRing)}
                    >
                      {example}
                    </button>
                    <Rule />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ol>
            {messages.map((m, idx) => (
              <li key={m.id || idx} className={cn(m.role === 'user' && idx > 0 && "mt-16 border-t pt-12")}>
                {m.role === 'user' ? (
                  <h2 className="t-title">{m.content}</h2>
                ) : (
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="t-label font-medium text-muted-foreground">Socrates</p>
                      {m.content && (
                        <ShareSnapshot
                          explanation={m.content}
                          question={messages[idx - 1]?.content || "ELI5 Explanation"}
                          difficulty={difficulty}
                        />
                      )}
                    </div>
                    <div className="prose prose-lg mt-2 max-w-none dark:prose-invert prose-headings:tracking-tight prose-strong:font-semibold">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    {!m.content && loading && idx === messages.length - 1 && (
                      <p role="status" className="t-body text-muted-foreground">Thinking…</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>

          {/* Render Quiz below the last assistant message if available */}
          {quizData && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
            <Quiz data={quizData} originalContext={messages[messages.length - 1].content} difficulty={difficulty} />
          )}
          {quizLoading && (
            <p role="status" className="mt-12 t-small text-muted-foreground">Writing a Knowledge Check…</p>
          )}

          <div ref={endOfMessagesRef} className="h-1 w-full shrink-0" />
        </div>
      </div>

      {/* Composer: a ruled bar with the one brand action */}
      <div className="shrink-0 border-t bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4 md:px-6">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <label htmlFor="question" className="sr-only">Your question</label>
            <Input
              id="question"
              ref={inputRef}
              placeholder={messages.length ? "Ask a follow-up…" : "Ask anything…"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={cn(fieldInputClass, "flex-1 t-body")}
              disabled={loading}
              autoComplete="off"
              autoFocus
            />
            <Button type="submit" variant="brand" size="cta" disabled={loading || !question.trim()}>
              {loading ? "Answering…" : "Ask"}
            </Button>
          </form>
          <p className="mt-2 t-label text-muted-foreground">AI can make mistakes. Check important facts.</p>
        </div>
      </div>
    </div>
  );
}
