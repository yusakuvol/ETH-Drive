"use client";

import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";
import { SiweMessage } from "siwe";
import {
  useAccount,
  useDisconnect,
  useEnsName,
  useNetwork,
  useSignMessage,
} from "wagmi";

export default function useAuth() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { chain } = useNetwork();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const callbackUrl = "/home";
      const message = new SiweMessage({
        domain: window.location.host,
        address: address as `0x${string}`,
        statement: process.env.NEXT_PUBLIC_SIGNIN_MESSAGE,
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id,
        nonce: await getCsrfToken(),
      });

      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      const response = await signIn("siwe", {
        message: JSON.stringify(message),
        redirect: true,
        signature,
        callbackUrl,
      });

      if (response?.error) console.log("Error occurred:", response.error);
    } catch (error) {
      window.alert("Error signing in");
      console.log("Error Occurred", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    address,
    ensName,
    disconnect,
    handleLogin,
  };
}
