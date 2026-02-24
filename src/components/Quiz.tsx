import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BrainCircuit, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

export interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: string;
}

export interface QuizData {
    questions: QuizQuestion[];
}

interface QuizProps {
    data: QuizData;
    originalContext: string;
    difficulty: string;
}

export function Quiz({ data, originalContext, difficulty }: QuizProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [explanationStream, setExplanationStream] = useState<string>("");
    const [isExplaining, setIsExplaining] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const handleOptionClick = async (option: string) => {
        if (selectedOption !== null) return; // Prevent clicking multiple times

        setSelectedOption(option);
        const correct = option === data.questions[currentIndex].correct_answer;
        setIsCorrect(correct);

        if (correct) {
            setScore(s => s + 1);
        } else {
            // If wrong, stream the personalized correction
            await fetchCorrection(option, data.questions[currentIndex]);
        }
    };

    const fetchCorrection = async (userAnswer: string, questionData: QuizQuestion) => {
        setIsExplaining(true);
        setExplanationStream("");
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const authHeader = session ? `Bearer ${session.access_token}` : "Bearer null";

            const res = await fetch(`/api/explain_quiz_answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": authHeader
                },
                body: JSON.stringify({
                    question: questionData.question,
                    user_answer: userAnswer,
                    correct_answer: questionData.correct_answer,
                    original_context: originalContext,
                    difficulty: difficulty
                }),
            });

            if (!res.ok) throw new Error("Correction failed");

            const reader = res.body?.getReader();
            if (!reader) return;
            const decoder = new TextDecoder();
            let buffer = "";

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
                            if (payload.type === 'chunk') {
                                setExplanationStream(prev => prev + payload.content);
                            }
                        } catch (err) { }
                    }
                }
            }
        } catch (e) {
            console.error(e);
            setExplanationStream("An error occurred while fetching the correction.");
        } finally {
            setIsExplaining(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < data.questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsCorrect(null);
            setExplanationStream("");
        } else {
            setFinished(true);
        }
    };

    if (finished) {
        return (
            <Card className="mt-8 border-primary/20 bg-primary/5">
                <CardContent className="pt-6 text-center space-y-4">
                    <BrainCircuit className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                    <p className="text-lg text-muted-foreground">
                        You scored {score} out of {data.questions.length}.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const currentQ = data.questions[currentIndex];

    return (
        <Card className="mt-8 shadow-md border-primary/10">
            <CardHeader className="bg-muted/20 border-b pb-4">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        Knowledge Check
                    </CardTitle>
                    <span className="text-sm font-medium text-muted-foreground">
                        Question {currentIndex + 1} of {data.questions.length}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <h4 className="text-lg font-medium leading-tight">{currentQ.question}</h4>

                <div className="space-y-3">
                    {currentQ.options.map((option, idx) => {
                        let btnVariant: "default" | "outline" | "destructive" | "secondary" = "outline";
                        let showIcon = false;
                        let icon = null;

                        if (selectedOption !== null) {
                            if (option === currentQ.correct_answer) {
                                btnVariant = "default"; // Highlight correct answer always after click
                                showIcon = true;
                                icon = <CheckCircle2 className="h-4 w-4 ml-2" />;
                            } else if (option === selectedOption && !isCorrect) {
                                btnVariant = "destructive"; // Highlight wrong choice
                                showIcon = true;
                                icon = <XCircle className="h-4 w-4 ml-2" />;
                            }
                        }

                        return (
                            <Button
                                key={idx}
                                variant={btnVariant}
                                className={`w-full justify-between h-auto py-3 px-4 text-left font-normal ${selectedOption === null ? 'hover:bg-primary/5 hover:border-primary/50' : ''}`}
                                onClick={() => handleOptionClick(option)}
                                disabled={selectedOption !== null}
                            >
                                <span className="whitespace-normal">{option}</span>
                                {showIcon && icon}
                            </Button>
                        );
                    })}
                </div>

                {selectedOption !== null && (
                    <div className="pt-4 border-t animate-in fade-in slide-in-from-top-2">
                        {isCorrect ? (
                            <div className="p-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-lg flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Correct!</p>
                                    <p className="text-sm opacity-90">Great job retaining that information.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-destructive font-semibold">
                                    <BrainCircuit className="h-4 w-4" />
                                    AI Tutor Feedback
                                </div>
                                {isExplaining && !explanationStream && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                                    </div>
                                )}
                                <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                                    <ReactMarkdown>{explanationStream}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleNext} disabled={isExplaining && !isCorrect}>
                                {currentIndex < data.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
