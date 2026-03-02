import { useState } from "react";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO } from "../../types";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";
import type { GeneratorMode, StartSessionRequest } from "./practiceApi";

interface StartSessionPanelProps {
    onSessionStarted: (sessionId: string, questions: QuestionDTO[], config: StartSessionRequest) => void;
}

export default function StartSessionPanel({ onSessionStarted }: StartSessionPanelProps) {
    const { showSnackbar } = useSnackbar();
    const [batchSize, setBatchSize] = useState(10);
    const [generatorMode, setGeneratorMode] = useState<GeneratorMode>("smart");
    const [loading, setLoading] = useState(false);

    const modeTips: Record<GeneratorMode, string> = {
        new: "New: generate questions from materials that have never been used.",
        wrong: "Wrong: regenerate similar questions based on your past mistakes.",
        review: "Review: directly reuse previously incorrect questions.",
        smart: "Smart: automatically mix new, wrong, and review questions.",
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            const request: StartSessionRequest = { batchSize, generatorMode };
            const res = await practiceApi.startSession(request);
            let questions = res.questions ?? [];

            // Some backends create session first and may return empty questions initially.
            if (questions.length === 0 && res.sessionId) {
                const nextBatch = await practiceApi.nextBatch(res.sessionId, request);
                questions = nextBatch.questions ?? [];
            }

            if (questions.length > 0) {
                onSessionStarted(res.sessionId, questions, request);
            } else {
                showSnackbar("No questions available in this mode. Try New/Wrong/Review/Smart or import more materials.", "warning");
            }
        } catch (err: any) {
            showSnackbar(err.message || "Failed to start session", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-6 border-b border-gray-100 text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Start a Practice Session</h2>
                </div>
                <div className="p-6 md:p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Batch Size
                        </label>
                        <select
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={20}>20 Questions</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Generator Mode
                        </label>
                        <select
                            value={generatorMode}
                            onChange={(e) => setGeneratorMode(e.target.value as GeneratorMode)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="new">New (Unseen Materials)</option>
                            <option value="wrong">Wrong (Regenerate from Mistakes)</option>
                            <option value="review">Review (Reuse Wrong Questions)</option>
                            <option value="smart">Smart (Adaptive Mix)</option>
                        </select>
                        <p className="mt-2 text-sm text-gray-500">{modeTips[generatorMode]}</p>
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full flex items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? "Generating..." : "Start Practice"}
                    </button>
                </div>
            </div>
        </div>
    );
}
