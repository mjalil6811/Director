import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

let nextConfig: NextConfig = {
  turbopack: {},
};

if (!isDev) {
  // @ts-ignore
  const withPWA = require("next-pwa");
  const pwaConfig = withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: false,
  });
  nextConfig = pwaConfig(nextConfig);
}

export default nextConfig;
