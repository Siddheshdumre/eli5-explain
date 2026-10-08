import { useState } from "react";
import { Button } from "./ui/button";
import { Rule } from "./editorial";
import { supabase } from "@/lib/supabase";
import { apiUrl } from "@/lib/api";
import { focusRing } from "@/lib/editorial";
import { cn } from "@/lib/utils";
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

            const res = await fetch(apiUrl(`/api/explain_quiz_answer`), {
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
                        } catch { /* ignore incomplete SSE frame */ }
                    }
                }
            }
        } catch (e) {
            console.error(e);
            setExplanationStream("The tutor couldn’t explain this one. Check your connection and try the next question.");
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

    const header = (
        <div className="flex items-baseline justify-between gap-4">
            <h3 className="t-small font-semibold">Knowledge Check</h3>
            {!finished && (
                <span className="t-label tabular-nums text-muted-foreground">
                    {currentIndex + 1} of {data.questions.length}
                </span>
            )}
        </div>
    );

    if (finished) {
        return (
            <section aria-label="Knowledge Check" className="mt-16 border-t pt-8">
                {header}
                <p className="mt-6 t-title">Quiz complete.</p>
                <p className="mt-2 t-body text-foreground/75">
                    You scored {score} of {data.questions.length}.
                </p>
            </section>
        );
    }

    const currentQ = data.questions[currentIndex];
    const answered = selectedOption !== null;

    return (
        <section aria-label="Knowledge Check" className="mt-16 border-t pt-8">
            {header}
            <p className="mt-6 t-title">{currentQ.question}</p>

            <div role="group" aria-label="Answer options" className="mt-6">
                <Rule heavy />
                {currentQ.options.map((option, idx) => {
                    const optionIsCorrect = option === currentQ.correct_answer;
                    const isPicked = option === selectedOption;
                    const verdict = answered && optionIsCorrect ? "Correct" : isPicked ? "Your pick" : null;
                    return (
                        <div key={idx}>
                            <button
                                type="button"
                                onClick={() => handleOptionClick(option)}
                                disabled={answered}
                                aria-pressed={isPicked}
                                className={cn(
                                    "group grid w-full grid-cols-[2.5rem_1fr] items-baseline gap-y-1 py-4 text-left t-body sm:grid-cols-[2.5rem_1fr_auto] sm:gap-x-6",
                                    focusRing,
                                    answered && !optionIsCorrect && !isPicked && "text-foreground/75"
                                )}
                            >
                                <span
                                    className={cn(
                                        "font-medium tabular-nums text-foreground/75 transition-colors",
                                        !answered && "group-hover:text-foreground"
                                    )}
                                    aria-hidden="true"
                                >
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span
                                    className={cn("quiz-option-text", answered && optionIsCorrect && "font-semibold")}
                                    data-struck={isPicked && !optionIsCorrect}
                                >
                                    {option}
                                </span>
                                {verdict && (
                                    <span className={cn("col-start-2 t-small sm:col-start-3 sm:text-right", optionIsCorrect ? "font-semibold" : "text-foreground/75")}>
                                        {verdict}
                                    </span>
                                )}
                            </button>
                            <Rule />
                        </div>
                    );
                })}
            </div>

            <div aria-live="polite">
                {answered && (
                    <div className="reveal-in mt-10">
                        {isCorrect ? (
                            <p className="t-body font-semibold">Correct! Great job retaining that information.</p>
                        ) : (
                            <figure>
                                {isExplaining && !explanationStream && (
                                    <p role="status" className="t-body text-muted-foreground">Thinking…</p>
                                )}
                                <blockquote className="prose prose-lg max-w-none dark:prose-invert">
                                    <ReactMarkdown>{explanationStream}</ReactMarkdown>
                                </blockquote>
                                <figcaption className="mt-4 t-small font-medium text-foreground/75">AI Tutor Feedback</figcaption>
                            </figure>
                        )}

                        <div className="mt-8">
                            <Button onClick={handleNext} disabled={isExplaining && !isCorrect} className="h-10 t-small">
                                {currentIndex < data.questions.length - 1 ? "Next question" : "Finish quiz"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
