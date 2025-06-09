/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Handle Coinbase SDK workers with ES6 modules
    config.module.rules.push({
      test: /node_modules\/@coinbase\/.*Worker\.js$/,
      type: "javascript/esm",
    });

    // General worker file handling
    config.module.rules.push({
      test: /\.worker\.js$/,
      type: "javascript/esm",
    });

    // Ensure proper module resolution for workers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
};

export default nextConfig;
