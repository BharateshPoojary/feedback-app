//To make the next auth fully functionable we need next-auth middleware
import { NextResponse } from "next/server";
// import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";
//These are part of Next.js's server API and allow you to handle and respond to HTTP requests within middleware
import { getToken } from "next-auth/jwt"; //this import is made to verify whether a user is having token or not

// `withAuth` augments your `Request` with the user's token.
// const secret = process.env.NEXTAUTH_SECRET;
// export default withAuth(
//   function middleware(req) {
//     //console.log(req.nextauth.token);
//     return NextResponse.next(); //passing the control to the next middleware
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         const { pathname } = req.nextUrl;
//         if (
//           pathname.startsWith("/sign-in") ||
//           pathname.startsWith("signUp") ||
//           pathname.startsWith("/verify")
//         ) {
//           return true;
//         }
//         if (pathname.startsWith("/dashboard")) {
//           // const token = await getToken({ req: request, secret });
//           if (token) {
//             //console.log("JWT Token", token);
//             return true;
//           }
//         }
//         return !!token;
//       },
//     },
//   }

//   //This sets up a matcher configuration for the middleware,
//   //  which specifies which routes the middleware will run on. Here:
//   ///dashboard/:path*: Matches /dashboard and any subpaths.
//   //The getToken function retrieves the token based on the request. If the user is logged in, token will contain their session information; otherwise, it will be null
//   // const url = request.nextUrl; //accessing the subPaths here like /sign-in ,Upetc
//   //It will contain the path from where the request is coming

// );
export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = await getToken({ req: request }); //assigning the request to req property of getToken() function as object so that it can access the token
  // //console.log("JWT Token", token);
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-Up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url)); //creates a new URL object, representing the absolute URL that results from combining the path '/dashboard' with the base URL from request.url.
  }
  // If no token then redirecting to signin page
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url)); //accessing the baseurl and appending /sign-in to it
  }
  return NextResponse.next(); //passing the control to the next middleware
}
export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path* ",
    "/sign-in",
    "/sign-Up",
    "/verify:path*",
  ],
};
