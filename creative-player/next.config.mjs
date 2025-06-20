/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disable SWC minification to avoid worker issues
  experimental: {
    esmExternals: "loose", // Handle ES modules more loosely
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ipfs.dweb.link",
      },
      {
        protocol: "https",
        hostname: "**.ipfs.nftstorage.link",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "**.arweave.net",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.arweave.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.spinamp.xyz",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sound.xyz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.mypinata.cloud",
      },
      {
        protocol: "https",
        hostname: "web3-music-pipeline.mypinata.cloud/ipfs",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "catalogworks.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "spinamp.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.spinamp.xyz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.spinamp.xyz",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "catalogworks.b-cdn.net",
        pathname: "ipfs/**",
      },
    ],
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
