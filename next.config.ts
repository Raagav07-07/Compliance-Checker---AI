import type { NextConfig } from "next";
import path from "path";

const emptyModule = path.join(__dirname, "lib", "emptyModule.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "chromadb",
    "@chroma-core/default-embed",
    "@chroma-core/ai-embeddings-common",
  ],
  experimental: {
    // @ts-expect-error Next.js turbopack config
    turbo: {
      resolveAlias: {
        "@chroma-core/default-embed/src/index.test.ts": emptyModule,
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@chroma-core/default-embed/src/index.test.ts": emptyModule,
    };
    return config;
  },
};

export default nextConfig;
