import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cgzkadwitoqpqtqwilnp.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Alternative (simpler, less strict):
    // domains: ["cgzkadwitoqpqtqwilnp.supabase.co"],
  },
};

export default nextConfig;
