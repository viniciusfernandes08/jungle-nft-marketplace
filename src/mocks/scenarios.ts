export const scenarioNames = [
  "default",
  "empty",
  "slow",
  "variable-latency",
  "network-error",
  "timeout",
  "http-500",
  "http-503",
  "session-expired",
  "forbidden",
  "favorite-error",
  "quote-error",
  "wallet-refused",
  "order-declined",
  "order-pending",
] as const;

export type ScenarioName = (typeof scenarioNames)[number];

export type RequestInfo = { method: string; path: string; authenticated: boolean };

export type Failure =
  | { type: "network" }
  | { type: "timeout" }
  | { type: "http"; status: number; code: string; message: string };

export type Scenario = {
  latencyMs: (requestIndex: number) => number;
  fail?: (request: RequestInfo) => Failure | null;
  emptyCatalog?: boolean;
};

const DEFAULT_LATENCY = 150;
const isNftRead = (r: RequestInfo) => r.method === "GET" && r.path.startsWith("/api/nfts");
const fixed = (ms: number) => () => ms;

export const scenarios: Record<ScenarioName, Scenario> = {
  default: { latencyMs: fixed(DEFAULT_LATENCY) },
  empty: { latencyMs: fixed(DEFAULT_LATENCY), emptyCatalog: true },
  slow: { latencyMs: fixed(2500) },
  "variable-latency": {
    latencyMs: (n) => [1800, 150, 900, 80, 1400][n % 5],
  },
  "network-error": { latencyMs: fixed(DEFAULT_LATENCY), fail: () => ({ type: "network" }) },
  timeout: { latencyMs: fixed(0), fail: (r) => (isNftRead(r) ? { type: "timeout" } : null) },
  "http-500": {
    latencyMs: fixed(DEFAULT_LATENCY),
    fail: (r) =>
      isNftRead(r)
        ? { type: "http", status: 500, code: "INTERNAL_ERROR", message: "Erro interno do servidor." }
        : null,
  },
  "http-503": {
    latencyMs: fixed(DEFAULT_LATENCY),
    fail: () => ({
      type: "http",
      status: 503,
      code: "SERVICE_UNAVAILABLE",
      message: "Serviço temporariamente indisponível.",
    }),
  },
  "session-expired": {
    latencyMs: fixed(DEFAULT_LATENCY),
    fail: (r) =>
      r.authenticated
        ? { type: "http", status: 401, code: "SESSION_EXPIRED", message: "Sua sessão expirou." }
        : null,
  },
  "favorite-error": {
    latencyMs: fixed(DEFAULT_LATENCY),
    fail: (r) =>
      r.path.startsWith("/api/favorites") && (r.method === "PUT" || r.method === "DELETE")
        ? { type: "http", status: 500, code: "INTERNAL_ERROR", message: "Erro interno do servidor." }
        : null,
  },
  "quote-error": {
    latencyMs: fixed(DEFAULT_LATENCY),
    fail: (r) =>
      r.method === "POST" && r.path === "/api/quote"
        ? { type: "http", status: 500, code: "INTERNAL_ERROR", message: "Erro interno do servidor." }
        : null,
  },
  forbidden: {
    latencyMs: fixed(DEFAULT_LATENCY),
    fail: (r) =>
      r.authenticated
        ? { type: "http", status: 403, code: "FORBIDDEN", message: "Você não tem permissão." }
        : null,
  },
  "wallet-refused": { latencyMs: fixed(DEFAULT_LATENCY) },
  "order-declined": { latencyMs: fixed(DEFAULT_LATENCY) },
  "order-pending": { latencyMs: fixed(DEFAULT_LATENCY) },
};

const SCENARIO_KEY = "kurio:mock-scenario";
let requestCounter = 0;

export function getScenarioName(): ScenarioName {
  try {
    const stored = localStorage.getItem(SCENARIO_KEY);
    if (stored && (scenarioNames as readonly string[]).includes(stored)) return stored as ScenarioName;
  } catch {}
  return "default";
}

export function getScenario(): Scenario {
  return scenarios[getScenarioName()];
}

export function setScenario(name: ScenarioName): void {
  requestCounter = 0;
  try {
    localStorage.setItem(SCENARIO_KEY, name);
  } catch {}
}

export function nextRequestIndex(): number {
  return requestCounter++;
}

export function applyScenarioFromUrl(): void {
  const name = new URLSearchParams(window.location.search).get("scenario");
  if (name && (scenarioNames as readonly string[]).includes(name)) setScenario(name as ScenarioName);
}
