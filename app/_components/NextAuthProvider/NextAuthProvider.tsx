"use client";

import { SessionProvider } from "next-auth/react";

type ProviderType = {
  children: React.ReactNode;
};

export default function NextAuthProvider({ children }: ProviderType) {
  return <SessionProvider>{children}</SessionProvider>;
}
