import { useState } from "react";
import MaterialList from "./MaterialList";
import MaterialImportDialog from "./MaterialImportDialog";

export default function MaterialsPage() {
    const [openImport, setOpenImport] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImportSuccess = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Materials Management</h1>
                    <p className="text-gray-500">Manage your vocabulary, phrases, and sentences.</p>
                </div>
                <button
                    onClick={() => setOpenImport(true)}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                    <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Import New
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <MaterialList key={refreshKey} />
            </div>

            <MaterialImportDialog
                open={openImport}
                onClose={() => setOpenImport(false)}
                onSuccess={handleImportSuccess}
            />
        </div>
    );
}
