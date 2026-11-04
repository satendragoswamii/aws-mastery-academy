import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check only: no cookie means "go to login".
 * The real session validation happens in the Data Access Layer (src/lib/auth/dal.ts).
 * The cookie name is duplicated here deliberately so this file imports no Node-only code.
 */
const SESSION_COOKIE = "ama_session";

export function proxy(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the login page, Next internals and static files.
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
