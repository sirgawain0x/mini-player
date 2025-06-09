/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disable SWC minification to avoid worker issues
  experimental: {
    esmExternals: "loose", // Handle ES modules more loosely
  },
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Handle Farcaster Frame SDK worker files and other Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Disable webpack worker support to avoid conflicts
    config.output.webassemblyModuleFilename = "static/wasm/[modulehash].wasm";
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

export default nextConfig;
