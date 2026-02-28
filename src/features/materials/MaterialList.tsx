import { useState, useEffect, useCallback } from "react";
import type { MaterialDTO } from "../../types";
import { materialsApi } from "./materialsApi";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

export default function MaterialList() {
    const { showSnackbar } = useSnackbar();
    const [materials, setMaterials] = useState<MaterialDTO[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Filters
    const [query, setQuery] = useState("");
    const [type, setType] = useState<string>("all");
    const [enabled, setEnabled] = useState<string>("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await materialsApi.getList({
                query: query ? query : undefined,
                type: type !== "all" ? type : undefined,
                enabled: enabled !== "all" ? enabled === "true" : undefined,
                page: page + 1,
                size: rowsPerPage,
            });
            setMaterials(res.items || []);
            setTotal(res.total || 0);
        } catch (err: any) {
            showSnackbar(err.message || "Failed to fetch materials", "error");
        } finally {
            setLoading(false);
        }
    }, [query, type, enabled, page, rowsPerPage, showSnackbar]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleToggleEnabled = async (material: MaterialDTO) => {
        try {
            const updated = await materialsApi.update(material.id, { enabled: !material.enabled });
            setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            showSnackbar(`Material ${updated.enabled ? "enabled" : "disabled"}`, "success");
        } catch (err: any) {
            showSnackbar(err.message || "Failed to update material", "error");
        }
    };

    return (
        <div className="w-full">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72 sm:max-w-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="all">All Types</option>
                            <option value="sentence">Sentence</option>
                            <option value="phrase">Phrase</option>
                            <option value="word">Word</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={enabled}
                            onChange={(e) => setEnabled(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value="all">All Status</option>
                            <option value="true">Enabled</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Content</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-24">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-48">Tags</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32">Created</th>
                            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-24">Enabled</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading && materials.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading materials...</p>
                                </td>
                            </tr>
                        ) : materials.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                                    No materials found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            materials.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                                        <div className="truncate max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl" title={row.content}>
                                            {row.content}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">
                                        {row.type}
                                    </td>
                                    <td className="px-3 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {row.tags?.map((t, i) => (
                                                <span key={i} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {new Date(row.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                        <button
                                            onClick={() => handleToggleEnabled(row)}
                                            className={`${row.enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2`}
                                            role="switch"
                                            aria-checked={row.enabled}
                                        >
                                            <span className={`${row.enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder (Simplistic for Tailwind demo) */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={(page + 1) * rowsPerPage >= total}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{Math.min(total, page * rowsPerPage + 1)}</span> to <span className="font-medium">{Math.min(total, (page + 1) * rowsPerPage)}</span> of <span className="font-medium">{total}</span> results
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                        </select>

                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={(page + 1) * rowsPerPage >= total}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
}
