import { useState } from "react";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO } from "../../types";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

interface StartSessionPanelProps {
    onSessionStarted: (sessionId: string, questions: QuestionDTO[]) => void;
}

export default function StartSessionPanel({ onSessionStarted }: StartSessionPanelProps) {
    const { showSnackbar } = useSnackbar();
    const [batchSize, setBatchSize] = useState(10);
    const [generatorMode, setGeneratorMode] = useState<"hybrid" | "llm" | "db_only">("hybrid");
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await practiceApi.startSession({ batchSize, generatorMode });
            if (res.questions && res.questions.length > 0) {
                onSessionStarted(res.sessionId, res.questions);
            } else {
                showSnackbar("No questions generated. Check your materials.", "warning");
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
                            onChange={(e) => setGeneratorMode(e.target.value as any)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="hybrid">Hybrid (DB + LLM)</option>
                            <option value="llm">LLM Only</option>
                            <option value="db_only">Database Only</option>
                        </select>
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
