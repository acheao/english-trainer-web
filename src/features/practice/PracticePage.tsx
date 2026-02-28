import { useState } from "react";
import StartSessionPanel from "./StartSessionPanel";
import QuestionCard from "./QuestionCard";
import AnswerEditor from "./AnswerEditor";
import GradingPanel from "./GradingPanel";
import BatchSummaryDialog from "./BatchSummaryDialog";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO, GradingDTO } from "../../types";

export default function PracticePage() {
    const { showSnackbar } = useSnackbar();

    // State Machine
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuestionDTO[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Grading State
    const [loadingGrade, setLoadingGrade] = useState(false);
    const [currentGrading, setCurrentGrading] = useState<GradingDTO | null>(null);
    const [batchResults, setBatchResults] = useState<GradingDTO[]>([]);

    // Dialog State
    const [showSummary, setShowSummary] = useState(false);

    const currentQuestion = questions[currentIndex];

    const handleSessionStarted = (sid: string, qs: QuestionDTO[]) => {
        setSessionId(sid);
        setQuestions(qs);
        setCurrentIndex(0);
        setBatchResults([]);
        setCurrentGrading(null);
        setShowSummary(false);
    };

    const handleSubmitAnswer = async (answer: string) => {
        setLoadingGrade(true);
        setCurrentGrading(null);
        try {
            const res = await practiceApi.submitAnswer({ questionId: currentQuestion.id, userAnswer: answer });
            setCurrentGrading(res);
            setBatchResults(prev => [...prev, res]);
        } catch (err: any) {
            showSnackbar(err.message || "Failed to submit answer", "error");
        } finally {
            setLoadingGrade(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentGrading(null);
        } else {
            setShowSummary(true);
        }
    };

    const handleNextBatch = (qs: QuestionDTO[]) => {
        setQuestions(qs);
        setCurrentIndex(0);
        setBatchResults([]);
        setCurrentGrading(null);
        setShowSummary(false);
    };

    const handleFinishSession = () => {
        setSessionId(null);
        setQuestions([]);
        setCurrentIndex(0);
        setBatchResults([]);
        setCurrentGrading(null);
        setShowSummary(false);
    };

    if (!sessionId || questions.length === 0) {
        return (
            <div className="max-w-6xl mx-auto py-8">
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice</h1>
                    <p className="text-gray-500">Hone your skills with AI-assisted or standard practice sessions.</p>
                </div>
                <StartSessionPanel onSessionStarted={handleSessionStarted} />
            </div>
        );
    }

    const progressPercentage = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Session</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Question {currentIndex + 1} of {questions.length}
                    </p>
                </div>
                <button
                    onClick={handleFinishSession}
                    className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-500 transition-colors bg-red-50 hover:bg-red-100 px-4 py-2 rounded-md"
                >
                    <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Exit Session
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentQuestion && (
                    <QuestionCard question={currentQuestion} />
                )}

                {!currentGrading && (
                    <AnswerEditor onSubmit={handleSubmitAnswer} disabled={loadingGrade} loading={loadingGrade} />
                )}

                {currentGrading && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <GradingPanel grading={currentGrading} />
                        <div className="flex justify-end mt-8">
                            <button
                                onClick={handleNextQuestion}
                                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-all transform active:scale-95"
                            >
                                {currentIndex < questions.length - 1 ? (
                                    <>
                                        Next Question
                                        <svg className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        Show Summary
                                        <svg className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <BatchSummaryDialog
                open={showSummary}
                sessionId={sessionId}
                results={batchResults}
                onNextBatch={handleNextBatch}
                onFinish={handleFinishSession}
            />
        </div>
    );
}
