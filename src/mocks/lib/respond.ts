import type { z } from "zod";
import { delay, HttpResponse, type DefaultBodyType, type HttpResponseResolver, type PathParams } from "msw";
import type { ApiErrorBody, FieldErrors } from "@/shared/domain/errors";
import { getScenario, nextRequestIndex } from "../scenarios";

export function apiError(status: number, code: string, message: string, fieldErrors?: FieldErrors) {
  const body: ApiErrorBody = { code, message, ...(fieldErrors ? { fieldErrors } : {}) };
  return HttpResponse.json(body, { status });
}

export function withScenario(
  resolver: HttpResponseResolver<PathParams, DefaultBodyType, DefaultBodyType>,
): HttpResponseResolver<PathParams, DefaultBodyType, DefaultBodyType> {
  return async (info) => {
    const scenario = getScenario();
    const url = new URL(info.request.url);
    const failure = scenario.fail?.({
      method: info.request.method,
      path: url.pathname,
      authenticated: info.request.headers.has("authorization"),
    });

    if (failure?.type === "timeout") await delay("infinite");
    await delay(scenario.latencyMs(nextRequestIndex()));
    if (failure?.type === "network") return HttpResponse.error();
    if (failure?.type === "http") return apiError(failure.status, failure.code, failure.message);

    return resolver(info);
  };
}

export async function readJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: ReturnType<typeof apiError> }> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    fieldErrors[issue.path.length > 0 ? issue.path.join(".") : "form"] ??= issue.message;
  }
  return { ok: false, response: apiError(422, "VALIDATION_ERROR", "Revise os dados enviados.", fieldErrors) };
}
