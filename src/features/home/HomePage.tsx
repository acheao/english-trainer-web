import { getApiBaseUrl } from "../../shared/config/runtime";

export default function HomePage() {
  const baseUrl = getApiBaseUrl();

  return (
    <div>
      <h2>home</h2>
      <p>api base url: {baseUrl}</p>
      <p>go to settings to change backend address.</p>
    </div>
  );
}
