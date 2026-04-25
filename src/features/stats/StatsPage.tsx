import { useState, useEffect } from "react";
import { statsApi } from "./statsApi";
import type { StatsOverview, ErrorTypeStat } from "./statsApi";
import { useNotice } from "../../shared/ui/useNotice";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { getErrorMessage } from "../../shared/i18n/message";
import { getErrorTypeLabel } from "../../shared/i18n/domain";

export default function StatsPage() {
  const { pushNotice } = useNotice();
  const { locale, isZh, formatDateTime } = useI18n();

  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [errorTypes, setErrorTypes] = useState<ErrorTypeStat[]>([]);
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState(false);

  const text = isZh
    ? {
        overviewFailed: "加载统计概览失败。",
        errorStatsFailed: "加载错误统计失败。",
        title: "统计",
        subtitle: "跟踪你的练习进展，并观察最常见的错误类型。",
        totalMaterials: "总材料数",
        practicedMaterials: "已练材料数",
        coverage: "练习覆盖率",
        unpracticedMaterials: "未练材料数",
        topErrors: "高频错误类型",
        last7Days: "最近 7 天",
        last30Days: "最近 30 天",
        empty: "这一时间段内还没有错误数据，继续保持。",
        lastSeen: "最近出现",
        count: (value: number) => `${value} 次`,
      }
    : {
        overviewFailed: "Failed to load overview stats.",
        errorStatsFailed: "Failed to load error stats.",
        title: "Statistics",
        subtitle: "Track your progress and analyze the error types that show up most often.",
        totalMaterials: "Total Materials",
        practicedMaterials: "Practiced Materials",
        coverage: "Practice Coverage",
        unpracticedMaterials: "Unpracticed Materials",
        topErrors: "Top Error Types",
        last7Days: "Last 7 Days",
        last30Days: "Last 30 Days",
        empty: "No error data is available for this period. Nice work.",
        lastSeen: "Last seen",
        count: (value: number) => `${value} times`,
      };

  useEffect(() => {
    const fetchOverview = async () => {
      setLoadingOverview(true);
      try {
        const res = await statsApi.getOverview();
        setOverview(res);
      } catch (error) {
        pushNotice(getErrorMessage(error, text.overviewFailed), "error");
      } finally {
        setLoadingOverview(false);
      }
    };

    void fetchOverview();
  }, [pushNotice, text.overviewFailed]);

  useEffect(() => {
    const fetchErrorTypes = async () => {
      setLoadingErrors(true);
      try {
        const res = await statsApi.getErrorTypes(range);
        setErrorTypes(res);
      } catch (error) {
        pushNotice(getErrorMessage(error, text.errorStatsFailed), "error");
      } finally {
        setLoadingErrors(false);
      }
    };

    void fetchErrorTypes();
  }, [pushNotice, range, text.errorStatsFailed]);

  return (
    <div className="mx-auto max-w-5xl py-2">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{text.title}</h1>
        <p className="text-gray-500">{text.subtitle}</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">{text.totalMaterials}</h3>
          {loadingOverview ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{overview?.totalMaterialsCount || 0}</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">{text.practicedMaterials}</h3>
          {loadingOverview ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : (
            <p className="text-3xl font-bold text-blue-600">{overview?.practicedMaterialsCount || 0}</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">{text.coverage}</h3>
          {loadingOverview ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : (
            <p className="text-3xl font-bold text-green-600">
              {overview ? `${Math.round((overview.practiceCoverage || 0) * 100)}%` : "0%"}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-500">{text.unpracticedMaterials}</h3>
          {loadingOverview ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : (
            <p className="text-3xl font-bold text-orange-500">{overview?.unpracticedMaterialsCount || 0}</p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-gray-900">{text.topErrors}</h2>

          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setRange("7d")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === "7d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {text.last7Days}
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                range === "30d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {text.last30Days}
            </button>
          </div>
        </div>

        <div className="p-0">
          {loadingErrors ? (
            <div className="flex justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          ) : errorTypes.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-500">{text.empty}</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {errorTypes.map((item, index) => (
                <li key={item.errorType} className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-gray-50">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-gray-900">
                      {index + 1}. {getErrorTypeLabel(item.errorType, locale)}
                    </p>
                    {item.lastSeenAt ? (
                      <p className="text-xs text-gray-500">
                        {text.lastSeen}: {formatDateTime(item.lastSeenAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    {text.count(item.count)}
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
