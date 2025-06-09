/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Temporarily disable minification to fix HeartbeatWorker.js issue
    if (!isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
