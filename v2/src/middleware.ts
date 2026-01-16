import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnAdmin = nextUrl.pathname.startsWith("/admin");
  const isOnLogin = nextUrl.pathname === "/admin/login";

  if (isOnAdmin && !isOnLogin && !isLoggedIn) {
    return Response.redirect(new URL("/admin/login", nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*"],
};
