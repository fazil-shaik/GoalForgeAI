import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and all subroutes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret:
        process.env.NEXTAUTH_SECRET ||
        "goalforge_super_secure_jwt_secret_dev_32_chars",
    });

    const hasSessionCookie =
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token") ||
      request.cookies.has("next-auth.session-token.0");

    // Strictly deny unauthenticated access
    if (!token && !hasSessionCookie) {
      const authUrl = new URL("/auth", request.url);
      authUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
