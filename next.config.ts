import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/**
 * CSP restrictiva: la tienda solo sirve imágenes y assets propios (las
 * imágenes de productos viven en /api/imagen o rutas /…). Los scripts
 * inline quedan permitidos porque Next.js hydrata con <script> inline
 * (horizontal a nonce se haría con middleware).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  `connect-src 'self'${isProd ? "" : " ws:"}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: false,
  partialPrefetching: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, { key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
