import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/score-guarantee",
        destination: "/",
        permanent: true,
      },
      {
        source: "/profile/score-guarantee",
        destination: "/profile",
        permanent: true,
      },
      {
        source: "/how-it-works",
        destination: "/#how-to-play",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
