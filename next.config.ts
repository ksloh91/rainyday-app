import type { NextConfig } from "next";
import path from "path";

/** Static export output in `out/` is consumed by Capacitor’s Android WebView. */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
