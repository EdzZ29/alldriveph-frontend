import type { NextConfig } from "next"

const API_URL = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "")

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
]

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/logo-mark.png", search: "" },
      { pathname: "/AllDriveph-partners/**", search: "" },
    ],
  },
  // Uploaded photos are served by the NestJS backend. API calls from the browser go through the
  // route handler in app/api/v1/rpc/route.ts, which keeps the auth cookie first party.
  async rewrites() {
    return [{ source: "/media/:path*", destination: `${API_URL}/media/:path*` }]
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ]
  },
}

export default nextConfig
