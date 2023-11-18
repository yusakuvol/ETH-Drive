import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "siwe",
      name: "siwe",
      credentials: {
        message: { label: "Message", type: "text", placeholder: "0x0" },
        signature: { label: "Signature", type: "text", placeholder: "0x0" },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || "");

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce: await getCsrfToken({ req: { headers: req.headers } }),
          });

          if (!result.success) throw new Error("Invalid Signature");

          if (result.data.statement !== process.env.NEXT_PUBLIC_SIGNIN_MESSAGE)
            throw new Error("Invalid Message");

          const rpcUrl =
            "https://mainnet.infura.io/v3/3d5f00f9a10e4c74ada2d617dd948857";
          const provider = new ethers.JsonRpcProvider(rpcUrl);

          const name = await provider.lookupAddress(siwe.address);
          if (!name) throw new Error("Missing name");

          const address = await provider.resolveName(name);
          if (!address) throw new Error("Missing address");

          const parentEnsDomain = await kv.hget("domain", "main");
          if (!parentEnsDomain) throw new Error("Internal server error");

          // input wallet name must belong to parentEnsDomain
          if (
            !name === parentEnsDomain &&
            !name.endsWith("." + parentEnsDomain)
          )
            throw new Error("Not Authorized");

          // 1. get wallet address list from kv
          // 2. if wallet address list does not include wallet address
          // 3. push wallet address to wallet address list
          const usersKvKey = "users:" + parentEnsDomain;
          const kvAddressList = await kv.lrange(usersKvKey, 0, -1);
          if (!kvAddressList.includes(siwe.address)) {
            await kv.lpush(usersKvKey, siwe.address);
          }

          return {
            id: siwe.address,
          };
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      // token.sub: wallet address
      session.address = token.sub;
      session.user.name = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};
