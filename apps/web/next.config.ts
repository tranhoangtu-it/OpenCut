import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false, // Disable source maps in production to reduce bundle size
  output: "standalone",
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Removed duplicate experimental block
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // Optimize client-side bundles
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // Split vendor code
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /node_modules/,
            priority: 20,
          },
          // Separate large libraries
          ffmpeg: {
            name: "ffmpeg",
            test: /[\\/]node_modules[\\/]@ffmpeg[\\/]/,
            chunks: "all",
            priority: 30,
          },
          icons: {
            name: "icons",
            test: /[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/,
            chunks: "all",
            priority: 25,
          },
          // Common chunks
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
      return config;
    },
  }),
};

export default nextConfig;
