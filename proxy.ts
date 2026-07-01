export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workout/:path*",
    "/water/:path*",
    "/progress/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
