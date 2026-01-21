import { useState } from "react";
import { ApiError } from "../../shared/api/errors";
import { pingBackend } from "./healthApi";

export default function PingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onPing = async () => {
    setLoading(true);
    setResult("");
    setError("");
    try {
      const data = await pingBackend();
      setResult(typeof data === "string" ? data : JSON.stringify(data, null, 2));
    } catch (e: any) {
      if (e instanceof ApiError) {
        setError(`${e.message}\n${e.bodyText}`);
      } else {
        setError(String(e?.message || e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>ping</h2>
      <button onClick={onPing} disabled={loading}>
        {loading ? "loading..." : "ping backend"}
      </button>

      {result && (
        <pre style={{ marginTop: 12, padding: 12, background: "#f6f6f6", whiteSpace: "pre-wrap" }}>
          {result}
        </pre>
      )}

      {error && (
        <pre style={{ marginTop: 12, padding: 12, background: "#fff1f1", whiteSpace: "pre-wrap" }}>
          {error}
        </pre>
      )}
    </div>
  );
}
