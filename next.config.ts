import type { NextConfig } from "next";

function siteApiHostPattern() {
  const host = process.env.SITE_API_HOST;
  if (!host) return [];
  try {
    const url = new URL(host);
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        pathname: "/storage/**" as const,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    remotePatterns: siteApiHostPattern(),
  },
};

export default nextConfig;
