import React, { useState } from "react";
import { materialsApi } from "./materialsApi";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

interface MaterialImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MaterialImportDialog({ open, onClose, onSuccess }: MaterialImportDialogProps) {
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [type, setType] = useState<"auto" | "sentence" | "phrase" | "word">("auto");
    const [tagsInput, setTagsInput] = useState("");
    const [result, setResult] = useState<{ success: number; skipped: number } | null>(null);

    if (!open) return null;

    const handleImport = async () => {
        const lines = content.split("\n").map(l => l.trim()).filter(l => l);
        if (!lines.length) {
            showSnackbar("Please enter some content to import.", "warning");
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t);
            const res = await materialsApi.import({ type, lines, tags: tags.length ? tags : undefined });

            const skipCount = res.skippedDuplicates ?? 0;
            const successCount = res.successfullyImported ?? 0;

            if (skipCount > 0) {
                setResult({ success: successCount, skipped: skipCount });

                if (successCount === 0) {
                    showSnackbar(skipCount === 1 ? "The content already exists." : "All imported content already exists.", "warning");
                } else {
                    showSnackbar(`Imported ${successCount} items; skipped ${skipCount} duplicates.`, "warning");
                }

                if (successCount > 0) {
                    onSuccess();
                }
            } else {
                showSnackbar(`Successfully imported ${successCount} materials.`, "success");
                onSuccess();
                handleClose();
            }
        } catch (err: any) {
            showSnackbar(err.message || "Failed to import materials", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setContent("");
        setTagsInput("");
        setResult(null);
        onClose();
    };

    return (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-gray-100">
                            <h3 className="text-xl font-semibold leading-6 text-gray-900" id="modal-title">
                                Import Materials
                            </h3>
                        </div>

                        <div className="px-4 py-5 sm:p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                    Type
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="auto">Auto-detect</option>
                                    <option value="sentence">Sentence</option>
                                    <option value="phrase">Phrase</option>
                                    <option value="word">Word</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                    placeholder="e.g. daily, work, advanced"
                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
                                    Material Content (One item per line)
                                </label>
                                <textarea
                                    rows={8}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="First line&#10;Second line&#10;..."
                                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 font-mono text-sm"
                                ></textarea>
                                <p className="mt-2 text-sm text-gray-500">
                                    Note: Duplicate materials are no longer allowed and will be skipped.
                                </p>
                            </div>

                            {result && result.skipped > 0 && (
                                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Skipped {result.skipped} duplicate item{result.skipped !== 1 ? 's' : ''}.
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 gap-2">
                            <button
                                type="button"
                                onClick={handleImport}
                                disabled={loading}
                                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 sm:w-auto transition-colors"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                Import
                            </button>
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
