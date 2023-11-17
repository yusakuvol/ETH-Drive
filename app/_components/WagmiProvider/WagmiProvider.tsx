"use client";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { useEffect, useState } from "react";
import { WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";

const chains = [mainnet];

const projectId = "cafed2ff06f2248ce9df205b37f5a5a7";

const metadata = {
  name: "Next Starter Template",
  description: "A Next.js starter template with Web3Modal v3 + Wagmi",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({ wagmiConfig, projectId, chains });

type ProviderType = {
  children: React.ReactNode;
};

export default function WagmiProvider({ children }: ProviderType) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      ) : null}
    </>
  );
}
