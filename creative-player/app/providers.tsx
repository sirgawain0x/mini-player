"use client";

import { type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { coinbaseWallet } from "wagmi/connectors";

const wagmiConfig = createConfig({
  chains: [base, baseSepolia], // Base mainnet first, then testnet for fallback
  connectors: [
    coinbaseWallet({
      appName: "creative-player",
      preference: "smartWalletOnly",
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(), // Base mainnet
    [baseSepolia.id]: http(), // Base Sepolia testnet (fallback)
  },
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <MiniKitProvider
        projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
      >
        {props.children}
      </MiniKitProvider>
    </WagmiProvider>
  );
}
