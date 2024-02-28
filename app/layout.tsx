"use client";

import Header from "@/app/components/Header/Header";
import NextAuthProvider from "@/app/components/NextAuthProvider/NextAuthProvider";
import WagmiProvider from "@/app/components/WagmiProvider/WagmiProvider";
import "@/styles/globals.css";
import { ThorinGlobalStyles, lightTheme } from "@ensdomains/thorin";
import { ThemeProvider } from "styled-components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider>
          <NextAuthProvider>
            <ThemeProvider theme={lightTheme}>
              <ThorinGlobalStyles />
              <div className="min-h-screen bg-base p-8 font-custom flex flex-col">
                <Header />
                {children}
              </div>
            </ThemeProvider>
          </NextAuthProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
