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
  },
};

export default withFlowbiteReact(nextConfig);