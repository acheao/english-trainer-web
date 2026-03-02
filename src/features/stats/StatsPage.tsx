import { useState, useEffect } from "react";
import { statsApi } from "./statsApi";
import type { StatsOverview, ErrorTypeStat } from "./statsApi";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

export default function StatsPage() {
    const { showSnackbar } = useSnackbar();

    const [overview, setOverview] = useState<StatsOverview | null>(null);
    const [errorTypes, setErrorTypes] = useState<ErrorTypeStat[]>([]);
    const [range, setRange] = useState<"7d" | "30d">("7d");

    const [loadingOverview, setLoadingOverview] = useState(false);
    const [loadingErrors, setLoadingErrors] = useState(false);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoadingOverview(true);
            try {
                const res = await statsApi.getOverview();
                setOverview(res);
            } catch (err: any) {
                showSnackbar(err.message || "Failed to load overview stats", "error");
            } finally {
                setLoadingOverview(false);
            }
        };
        fetchOverview();
    }, [showSnackbar]);

    useEffect(() => {
        const fetchErrorTypes = async () => {
            setLoadingErrors(true);
            try {
                const res = await statsApi.getErrorTypes(range);
                setErrorTypes(res);
            } catch (err: any) {
                showSnackbar(err.message || "Failed to load error stats", "error");
            } finally {
                setLoadingErrors(false);
            }
        };
        fetchErrorTypes();
    }, [range, showSnackbar]);

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics</h1>
                <p className="text-gray-500">Track your progress and analyze common errors.</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Materials</h3>
                    {loadingOverview ? (
                        <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full"></div>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900">{overview?.totalMaterialsCount || 0}</p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Practiced Materials</h3>
                    {loadingOverview ? (
                        <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full"></div>
                    ) : (
                        <p className="text-3xl font-bold text-blue-600">{overview?.practicedMaterialsCount || 0}</p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Practice Coverage</h3>
                    {loadingOverview ? (
                        <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full"></div>
                    ) : (
                        <p className="text-3xl font-bold text-green-600">
                            {overview ? `${Math.round((overview.practiceCoverage || 0) * 100)}%` : "0%"}
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Unpracticed Materials</h3>
                    {loadingOverview ? (
                        <div className="h-10 w-10 animate-pulse bg-gray-200 rounded-full"></div>
                    ) : (
                        <p className="text-3xl font-bold text-orange-500">{overview?.unpracticedMaterialsCount || 0}</p>
                    )}
                </div>
            </div>

            {/* Error Types List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Top Error Types</h2>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setRange("7d")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${range === "7d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => setRange("30d")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${range === "30d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                }`}
                        >
                            Last 30 Days
                        </button>
                    </div>
                </div>

                <div className="p-0">
                    {loadingErrors ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : errorTypes.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <p className="text-gray-500">No error data available for this period. Great job!</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {errorTypes.map((err, index) => (
                                <li key={err.errorType} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {index + 1}. {err.errorType}
                                        </p>
                                        {err.lastSeenAt && (
                                            <p className="text-xs text-gray-500">
                                                Last seen: {new Date(err.lastSeenAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="bg-red-50 text-red-700 font-medium px-3 py-1 rounded-full text-sm flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                        {err.count} times
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
