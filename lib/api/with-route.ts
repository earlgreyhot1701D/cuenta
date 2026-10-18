// Job: time, log, session-check and error-wrap an API route handler.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { log, type LogFields } from "@/lib/log";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** Throw inside a handler to answer with this status and a one-line message. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: Record<string, unknown>,
    /** Extra detail for the log line only (never sent to the browser); email addresses are scrubbed. */
    public logDetail?: string,
  ) {
    super(message);
  }
}

/** Handlers add safe fields (invoice number, cafe name, message id) to the log line here. */
export type LogContext = Partial<Pick<LogFields, "ip" | "invoiceNumber" | "cafe" | "messageId">>;

type Handler<C> = (req: Request, ctx: C, logCtx: LogContext) => Promise<Response>;

export function withRoute<C>(route: string, handler: Handler<C>, opts: { public?: boolean } = {}) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const start = Date.now();
    const logCtx: LogContext = {};
    const done = (res: Response, outcome: LogFields["outcome"], error?: string) => {
      log({ route, outcome, ms: Date.now() - start, status: res.status, ...logCtx, ...(error ? { error } : {}) });
      return res;
    };
    try {
      if (!opts.public) {
        const token = (await cookies()).get(SESSION_COOKIE)?.value;
        if (!(await verifySessionToken(token))) {
          return done(NextResponse.json({ error: "Not signed in." }, { status: 401 }), "rejected");
        }
      }
      const res = await handler(req, ctx, logCtx);
      return done(res, res.ok ? "ok" : "rejected");
    } catch (err) {
      if (err instanceof HttpError) {
        const res = NextResponse.json({ error: err.message, ...err.body }, { status: err.status });
        const detail = err.logDetail ? `${err.message} (${err.logDetail.replace(/\S+@\S+/g, "<email>")})` : err.message;
        return done(res, "rejected", detail);
      }
      const message = err instanceof Error ? err.message : String(err);
      return done(NextResponse.json({ error: "Something went wrong." }, { status: 500 }), "error", message);
    }
  };
}
