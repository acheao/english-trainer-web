import type { GradingDTO } from "../../types";

interface GradingPanelProps {
    grading: GradingDTO;
}

export default function GradingPanel({ grading }: GradingPanelProps) {
    const isSuccess = grading.isCorrect;
    const borderColor = isSuccess ? "border-green-500" : "border-yellow-500";
    const bgColor = isSuccess ? "bg-green-50" : "bg-yellow-50";
    const textColor = isSuccess ? "text-green-700" : "text-yellow-700";

    return (
        <div className={`mt-6 rounded-xl border-2 overflow-hidden shadow-sm ${borderColor}`}>
            <div className={`p-4 md:p-6 ${bgColor} flex items-center justify-between border-b ${borderColor} border-opacity-30`}>
                <div className="flex items-center gap-3">
                    {isSuccess ? (
                        <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                        </svg>
                    )}
                    <h3 className={`text-xl font-bold ${textColor}`}>Score: {grading.score}/100</h3>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8">
                {grading.rawText ? (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <h3 className="text-sm font-medium text-red-800">Failed to parse grading result properly:</h3>
                        <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                            {grading.rawText}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Corrected Answer */}
                        <div>
                            <h4 className="flex items-center text-sm font-medium tracking-wide text-gray-500 uppercase mb-3">
                                <svg className="mr-2 h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                </svg>
                                Corrected Version
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-gray-900 shadow-inner">
                                {grading.correctedAnswer}
                            </div>
                        </div>

                        {/* Error Types */}
                        {grading.errorTypes && grading.errorTypes.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-3">Issues Found</h4>
                                <div className="flex flex-wrap gap-2">
                                    {grading.errorTypes.map((err, i) => (
                                        <span key={i} className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
                                            {err}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-100"></div>

                        {/* Explanation & Suggestions */}
                        <div>
                            <h4 className="flex items-center text-sm font-medium tracking-wide text-gray-500 uppercase mb-3">
                                <svg className="mr-2 h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.829 1.504-2.115a4.484 4.484 0 003.3-4.322c0-2.492-2.022-4.514-4.514-4.514h-.052m-8.98 11.04v-.192c0-.983-.658-1.829-1.504-2.115a4.485 4.485 0 01-3.3-4.322c0-2.492 2.022-4.514 4.514-4.514h.052m8.98 11.04cm0 0" />
                                </svg>
                                Explanation
                            </h4>
                            <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                                {grading.explanationZh}
                            </p>

                            {grading.suggestions && grading.suggestions.length > 0 && (
                                <ul className="space-y-3">
                                    {grading.suggestions.map((sug, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 mr-3">
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="text-gray-700 leading-relaxed">{sug}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
