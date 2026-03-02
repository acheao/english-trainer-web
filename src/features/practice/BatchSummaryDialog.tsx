import { useSnackbar } from "../../shared/ui/SnackbarProvider";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO, GradingDTO } from "../../types";
import { useState } from "react";
import type { GeneratorMode } from "./practiceApi";

interface BatchSummaryDialogProps {
    open: boolean;
    sessionId: string;
    results: GradingDTO[];
    batchSize: number;
    generatorMode: GeneratorMode;
    onNextBatch: (questions: QuestionDTO[]) => void;
    onFinish: () => void;
}

export default function BatchSummaryDialog({
    open,
    sessionId,
    results,
    batchSize,
    generatorMode,
    onNextBatch,
    onFinish,
}: BatchSummaryDialogProps) {
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // Compute stats
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
    const correctCount = results.filter(r => r.isCorrect).length;

    const errorTypesCount = results.flatMap(r => r.errorTypes || []).reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topErrorTypes = Object.entries(errorTypesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const handleNextBatch = async () => {
        setLoading(true);
        try {
            const res = await practiceApi.nextBatch(sessionId, { batchSize, generatorMode });
            if (res.questions && res.questions.length > 0) {
                onNextBatch(res.questions);
            } else {
                showSnackbar("No more questions available for this session.", "info");
                onFinish();
            }
        } catch (err: any) {
            showSnackbar(err.message || "Failed to fetch next batch", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="px-6 py-8 text-center sm:px-10">
                            <h2 className="text-3xl font-extrabold text-blue-600 mb-8 tracking-tight">Batch Completed!</h2>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                    <div className="text-5xl font-black text-blue-600 mb-2">{avgScore}</div>
                                    <div className="text-sm font-medium text-blue-800 uppercase tracking-wider">Avg Score</div>
                                </div>
                                <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                                    <div className="text-5xl font-black text-green-600 mb-2">{correctCount}<span className="text-3xl text-green-400">/{results.length}</span></div>
                                    <div className="text-sm font-medium text-green-800 uppercase tracking-wider">Correct</div>
                                </div>
                            </div>

                            {topErrorTypes.length > 0 && (
                                <div className="text-left mb-8">
                                    <h4 className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-3 text-center">Top Focus Areas</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {topErrorTypes.map(([type, count]) => (
                                            <span key={type} className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                {type} <span className="ml-1.5 bg-yellow-200 text-yellow-900 rounded-full px-1.5 py-0.5">{count}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-lg text-gray-600 font-medium">
                                Great job! Ready for the next set of questions?
                            </p>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-10 gap-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleNextBatch}
                                disabled={loading}
                                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:w-auto transition-colors"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? "Loading..." : "Next Batch"}
                            </button>
                            <button
                                type="button"
                                onClick={onFinish}
                                disabled={loading}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                            >
                                Finish Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
