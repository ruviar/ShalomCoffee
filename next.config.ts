import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    // TypeScript 7 es el port nativo y no expone la API de compilador que Next
    // usa por defecto. Con esta bandera el chequeo de tipos pasa por el CLI.
    useTypeScriptCli: true,
  },
};

export default nextConfig;
