"use client";

import useAuth from "@/app/_hooks/useAuth/useAuth";
import "@/styles/globals.css";
import { Button, ExitSVG, Profile } from "@ensdomains/thorin";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useDisconnect } from "wagmi";

export default function Header() {
  const { isConnected, address, ensName, disconnect } = useAuth();
  const { open } = useWeb3Modal();
  const { disconnectAsync } = useDisconnect();

  const handleSignOut = async () => {
    await disconnectAsync();
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="w-full h-12 flex justify-between">
      <div className="flex space-x-2">
        <Link
          href="/home"
          className="flex justify-center items-center space-x-4 text-3xl font-bold hover:opacity-70"
        >
          <Image src="/logo.svg" alt="logo" width={70} height={70} />
          <span className="text-base-blue">ETH Storage</span>
        </Link>
      </div>
      <nav>
        <div className="w-48">
          {isConnected ? (
            <div className="w-24">
              <Profile
                address={address || ""}
                ensName={ensName || ""}
                dropdownItems={[
                  {
                    label: "Disconnect",
                    onClick: () => handleSignOut(),
                    color: "red",
                    icon: <ExitSVG />,
                  },
                ]}
              />
            </div>
          ) : (
            <Button
              shape="rounded"
              onClick={() => {
                open();
              }}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
