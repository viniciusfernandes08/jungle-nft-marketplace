import { env } from "@/config/env";

export async function enableMocking() {
  if (!env.enableMocks) return;
  const [{ worker }, { exposeMockControls }, { applyScenarioFromUrl }] = await Promise.all([
    import("@/mocks/browser"),
    import("@/mocks/controls"),
    import("@/mocks/scenarios"),
  ]);
  applyScenarioFromUrl();
  exposeMockControls();
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}
