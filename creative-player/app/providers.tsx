"use client";

import { type ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { coinbaseWallet } from "wagmi/connectors";

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "creative-player",
      preference: "smartWalletOnly",
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <MiniKitProvider
        chain={base}
        projectId="4dbcea92-3e01-46b1-9ea3-3d8de9bfaaf5"
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        notificationProxyUrl="/api/notify"
        config={{
          appearance: {
            mode: "auto",
            theme: "mini-app-theme",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            logo: process.env.NEXT_PUBLIC_ICON_URL,
          },
        }}
      >
        {props.children}
      </MiniKitProvider>
    </WagmiProvider>
  );
}
