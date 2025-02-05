//To make the next auth fully functionable we need next-auth middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
//These are part of Next.js's server API and allow you to handle and respond to HTTP requests within middleware
import { getToken } from "next-auth/jwt"; //this import is made to verify whether a user is having token or not

export const config = {
  matcher: ["/dashboard/:path* ", "/sign-in", "/sign-up", "/verify:path*"],
};
//This sets up a matcher configuration for the middleware,
//  which specifies which routes the middleware will run on. Here:
///dashboard/:path*: Matches /dashboard and any subpaths.
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  //The getToken function retrieves the token based on the request. If the user is logged in, token will contain their session information; otherwise, it will be null
  const url = request.nextUrl; //accessing the subPaths here like /sign-in ,Upetc
  //It will contain the path from where the request is coming

  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/signUp") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url)); //creates a new URL object, representing the absolute URL that results from combining the path '/dashboard' with the base URL from request.url.
  }
  //If no token then redirecting to signin page
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url)); //accessing the baseurl and appending /sign-in to it
  }
  return NextResponse.next(); //passing the control to the next middleware
}
