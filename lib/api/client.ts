// Job: client-side fetch wrapper that returns data or a one-line error message.
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string; data?: Record<string, unknown> };

export async function api<T = unknown>(
  route: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(route, {
      method: init.method ?? "GET",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(route, res.status, data?.error);
      return { ok: false, status: res.status, message: data?.error ?? "Couldn't reach the app. Try again.", data };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    console.error(route, err);
    return { ok: false, status: 0, message: "Couldn't reach the app. Try again." };
  }
}
