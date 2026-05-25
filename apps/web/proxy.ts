import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard"];
const AUTH_PAGES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // NOTE: proxy (formerly called middleware) CAN read httpOnly cookies - it runs on the server/edge and
  // has access to the raw Cookie request header. It just can't *verify* the
  // JWT (no secret), so we do an existence check here. A stale/invalid token
  // will be caught when SWR calls the API and gets a 401.
  const hasToken = request.cookies.has("accessToken");

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !hasToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals and static files
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"], // NOSONAR: String.raw would make the static AST parsing during the next build step fail
};
