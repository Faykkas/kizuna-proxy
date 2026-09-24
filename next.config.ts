import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "sumvesusvpmmfkwbtlxi.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  // Baseline hardening headers. No Content-Security-Policy here: the site
  // loads several third-party scripts (Trustpilot, Tawk.to, Google Fonts,
  // Vercel Analytics, PayPal) and a CSP tight enough to matter needs a
  // careful per-script audit — worth doing as its own pass, not bundled in
  // here where getting it wrong could silently break checkout or the chat
  // widget in production.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
