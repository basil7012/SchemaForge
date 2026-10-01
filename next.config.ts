import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect bare domain → www (permanent 308 to preserve request method)
      {
        source: "/:path*",
        has: [{ type: "host", value: "schemaforge.online" }],
        destination: "https://www.schemaforge.online/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
