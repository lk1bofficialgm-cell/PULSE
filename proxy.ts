export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workout/:path*",
    "/water/:path*",
    "/leaderboard/:path*",
    "/progress/:path*",
    "/profile/:path*",
  ],
};
