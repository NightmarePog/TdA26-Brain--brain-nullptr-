import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "http.cat",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
