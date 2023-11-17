"use client";

import useAuth from "@/app/_hooks/useAuth/useAuth";
import { Button } from "@ensdomains/thorin";

export default function Auth() {
  const { handleLogin, isConnected, isLoading } = useAuth();

  return (
    <main className="flex flex-col grow items-center justify-center bg-base space-y-6">
      <h1 className="text-4xl font-bold text-base-blue">
        Your Web3 Storage Solution
      </h1>
      <p className="text-base-gray text-center">
        Decentralized Drive harnesses ENS and Web3.Storage for secure,
        <br />
        blockchain-based file management.
        <br />
        Simple, efficient, and future-ready – elevate your digital storage into
        the Web3 era.
      </p>
      <div className="w-64">
        <Button
          disabled={isLoading || !isConnected}
          loading={isLoading}
          onClick={handleLogin}
        >
          {isConnected ? "Sign Message to Login" : "Please connect wallet"}
        </Button>
      </div>
    </main>
  );
}
