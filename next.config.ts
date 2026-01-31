import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      "via.placeholder.com",
      "media1.giphy.com",
      "media.giphy.com",
    ], // autorise ce domaine
  },
};

export default nextConfig;
