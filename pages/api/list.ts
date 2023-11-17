import { kv } from "@vercel/kv";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }
    const result = [];

    // Vercel KV から、同一ドメインユーザがアップロード済のファイルを取得
    const parentEnsDomain = await kv.hget("domain", "main");
    const usersKvKey = "users:" + parentEnsDomain;
    const kvAddressList = await kv.lrange(usersKvKey, 0, -1);
    for (const kvAddress of kvAddressList) {
      const filesKvKey = 'upload_files:' + kvAddress;
      const uploadFiles = await kv.lrange(filesKvKey, 0, -1);
      for (const uploadFile of uploadFiles) {
        result.push({
          cid: uploadFile.cid,
          filePath: uploadFile.filePath,
        });
      }
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("API error", error);
    res.status(500).send("Internal Server Error");
  }
}
