import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90],
    // La carta dinamica deja que el dueño pegue cualquier URL https en
    // foto_url. Sin un comodin aqui, Next.js rechazaria imagenes de hosts no
    // listados y cada foto nueva de un servicio distinto exigiria un
    // redeploy — justo lo que la carta dinamica quiere evitar.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
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
