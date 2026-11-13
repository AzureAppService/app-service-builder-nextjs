"use client";

import { useState } from "react";

export default function HealthCheck() {
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState("Check the JSON health endpoint without leaving this page.");

  async function refreshHealth() {
    setChecking(true);
    setHealth("Checking /health…");
    try {
      const response = await fetch("/health", { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("HTTP health failure");
      const body = await response.json();
      if (body.status !== "ok" || body.app !== "app-service-builder-nextjs") throw new Error("Unexpected health response");
      setHealth("The app responded successfully to /health. This checks this app only, not Azure deployment status.");
    } catch {
      setHealth("App health check failed. Retry, or inspect /health and your app logs.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section aria-label="App health">
      <button className="secondary" type="button" disabled={checking} onClick={refreshHealth}>
        {checking ? "Checking health…" : "Check app health"}
      </button>
      <p className="health-result" role="status">{health}</p>
    </section>
  );
}
