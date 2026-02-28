import type { QuestionDTO } from "../../types";
import { useState } from "react";

interface QuestionCardProps {
    question: QuestionDTO;
}

export default function QuestionCard({ question }: QuestionCardProps) {
    const [showHint, setShowHint] = useState(false);

    const getTypeStyle = (type: string) => {
        switch (type) {
            case "translate": return "bg-blue-50 text-blue-700 border-blue-200";
            case "correct": return "bg-red-50 text-red-700 border-red-200";
            case "rewrite": return "bg-purple-50 text-purple-700 border-purple-200";
            case "cloze": return "bg-green-50 text-green-700 border-green-200";
            case "compose": return "bg-indigo-50 text-indigo-700 border-indigo-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border uppercase tracking-wide ${getTypeStyle(question.type)}`}>
                        {question.type}
                    </span>

                    {question.referenceAnswer && (
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className={`p-1.5 rounded-full transition-colors ${showHint ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                            title="Show hint"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="text-xl md:text-2xl font-medium text-gray-900 leading-relaxed mb-2">
                    {question.prompt}
                </div>

                {showHint && question.referenceAnswer && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 border-dashed animate-in fade-in zoom-in duration-200">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Hint:</span> {question.referenceAnswer.join(" / ")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
