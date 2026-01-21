import { useEffect, useState } from "react";
import { clearApiBaseUrlOverride, getApiBaseUrl, setApiBaseUrl } from "../../shared/config/runtime";

export default function SettingsPage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(getApiBaseUrl());
  }, []);

  const save = () => {
    const v = url.trim();
    if (!v.startsWith("http://") && !v.startsWith("https://")) {
      alert("please start with http:// or https://");
      return;
    }
    setApiBaseUrl(v);
    alert("saved");
  };

  const reset = () => {
    clearApiBaseUrlOverride();
    setUrl(getApiBaseUrl());
    alert("reset to env default");
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h2>settings</h2>
      <label style={{ display: "block", marginBottom: 6 }}>backend api base url</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="http://127.0.0.1:8080"
        style={{ width: "100%", padding: 8 }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={save}>save</button>
        <button onClick={reset}>reset</button>
      </div>
    </div>
  );
}
