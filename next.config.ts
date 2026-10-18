// Job: Next.js configuration for Cuenta.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serverless Chromium ships its own brotli binaries; keep it out of the bundler and trace them in.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    // Keys are globs, so "[id]" would be a character class; "*" matches the dynamic segment.
    "/api/invoices/*/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/api/invoices/*/email": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
  async headers() {
    // Private tool: no response, page or static file is for search engines.
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
