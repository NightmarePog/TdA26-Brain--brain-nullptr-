import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "http.cat",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.tourde.app",
        pathname: "/api/courses/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_URL || "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_API_URL || "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/courses/**",
      },
    ],
    domains: ["www.google.com"],
  },
};

export default withFlowbiteReact(nextConfig);
