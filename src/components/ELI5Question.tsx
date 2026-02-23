import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Mermaid } from "./Mermaid";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Brain, Book, Sparkles, Globe, Cpu } from "lucide-react";
import { useToast } from "./ui/use-toast";

interface QuestionResponse {
  answer: string;
  contexts?: string[];
}

export function ELI5Question() {
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("ELI5 (Child)");
  const [format, setFormat] = useState("Standard");
  const [contextSource, setContextSource] = useState("wikipedia");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResponse({ answer: "", contexts: [] }); // Clear the previous answer for the new stream
    try {
      // Get the user's secure JWT token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please log in to ask a question.");

      // In Vercel, the API is served on the same domain under /api, so we use a relative path
      const res = await fetch(`/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          question: question.trim(),
          difficulty,
          format_option: format,
          context_source: contextSource,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      // Read the Server-Sent Event (SSE) Stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream available");

      const decoder = new TextDecoder();
      let buffer = "";
      let currentAnswer = "";
      let currentContexts: string[] = [];

      // Loop as long as the connection is open
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Decode the binary chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newlines
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ""; // keep incomplete parts in the buffer

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const dataStr = part.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const payload = JSON.parse(dataStr);
              if (payload.type === 'context') {
                // Determine if it's an agentic thought or wikipedia context
                currentContexts = [...currentContexts, payload.content];
                setResponse(prev => ({
                  answer: prev?.answer || "",
                  contexts: currentContexts
                }));
              } else if (payload.type === 'chunk') {
                // Slowly append the token to create a ChatGPT typewriter effect
                // Groq is so fast we have to artificially slow it down
                currentAnswer += payload.content;
                setResponse(prev => ({
                  answer: currentAnswer,
                  contexts: prev?.contexts || []
                }));
                // Wait 15ms between each chunk render
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
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            ELI5 Universe Builder
          </CardTitle>
          <CardDescription>
            Ask any question and get an explanation at your preferred difficulty level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="What would you like to learn about?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELI5 (Child)">ELI5 (Child)</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Answer Style</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Storytelling">Storytelling</SelectItem>
                    <SelectItem value="Technical Breakdown">Technical Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Information Source</label>
                <Select value={contextSource} onValueChange={setContextSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wikipedia">Basic Wikipedia</SelectItem>
                    <SelectItem value="advanced_web_search">Agentic Web Search</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {contextSource === "advanced_web_search" ? "Agents Researching..." : "Thinking..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Explanation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {response && (
        <div className="space-y-6">
          {response.contexts && response.contexts.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader className="py-4">
                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                  {contextSource === "advanced_web_search" ? <Globe className="h-4 w-4" /> : <Book className="h-4 w-4" />}
                  {contextSource === "advanced_web_search" ? "Agent Search Log" : "Wikipedia Context Used"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {response.contexts.map((ctx, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border">
                    {ctx}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {response.answer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        if (match && match[1] === 'mermaid') {
                          return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                        }
                        return <code {...rest} className={className}>{children}</code>;
                      }
                    }}
                  >
                    {response.answer}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 