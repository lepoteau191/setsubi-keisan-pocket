import type { NextConfig } from "next";

// `NEXT_PUBLIC_BASE_PATH=/repository-name` を指定すると GitHub Pages 配下でも動作する。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
