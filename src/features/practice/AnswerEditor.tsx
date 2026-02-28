import { useState } from "react";
import type { KeyboardEvent } from "react";

interface AnswerEditorProps {
    onSubmit: (answer: string) => void;
    disabled: boolean;
    loading: boolean;
}

export default function AnswerEditor({ onSubmit, disabled, loading }: AnswerEditorProps) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = () => {
        if (answer.trim()) {
            onSubmit(answer.trim());
            setAnswer("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all">
                <textarea
                    rows={4}
                    placeholder="Type your answer here... (Cmd/Ctrl + Enter to submit)"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={disabled || loading}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="block w-full resize-y border-0 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-lg sm:leading-relaxed bg-transparent"
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || disabled || loading}
                    className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Answer
                            <svg className="-mr-1 ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
