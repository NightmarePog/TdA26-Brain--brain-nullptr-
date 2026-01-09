import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

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
    domains: ["www.google.com"],
  },
};

export default withFlowbiteReact(nextConfig);
