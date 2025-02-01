import { type NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // If the user is authenticated and trying to access auth pages, redirect to home
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname.startsWith("/error"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the user is not authenticated and trying to access protected routes, redirect to sign-in
  if (
    !token &&
    (url.pathname === "/" || url.pathname.startsWith("/protected"))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // For all other cases, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/protected/:path*",
    "/error/:path*",
  ],
};
