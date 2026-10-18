// Job: require a valid PIN session for every page and API route except the open ones.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const OPEN_PATHS = ["/pin", "/api/session", "/health"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (OPEN_PATHS.includes(pathname) || pathname.startsWith("/print/")) return NextResponse.next();

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/pin", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logos/|invoice/|.*\\.png$).*)"],
};
