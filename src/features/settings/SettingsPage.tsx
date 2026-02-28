import { useEffect, useState } from "react";
import { clearApiBaseUrlOverride, getApiBaseUrl, setApiBaseUrl } from "../../shared/config/runtime";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, []);

  const notify = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const save = () => {
    const v = url.trim();
    if (!v.startsWith("http://") && !v.startsWith("https://")) {
      notify("Please start with http:// or https://");
      return;
    }
    setApiBaseUrl(v);
    notify("Saved successfully");
  };

  const reset = () => {
    clearApiBaseUrlOverride();
    setUrl(getApiBaseUrl());
    notify("Reset to environment default");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-500">Configure your application preferences.</p>
      </div>

      {showNotification && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-100 flex items-center justify-between">
          <p className="text-sm font-medium">{notificationMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Backend Connection</h2>
            <p className="text-sm text-gray-500 mb-6">Set the base URL for the backend API server. This is stored locally in your browser.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Base URL
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="http://127.0.0.1:80"
                    className="block w-full rounded-md border-gray-300 py-2.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={save}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={reset}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
