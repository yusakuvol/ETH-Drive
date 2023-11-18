import { kv } from "@vercel/kv";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "@/utils/authOption/authOption";
import { getServerSession } from "next-auth/next";

interface UploadFile {
  cid: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const walletAddress = session?.user?.name;

    if (!walletAddress) {
      res.status(401).send("Unauthorized");
      return;
    }

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
      const filesKvKey = "upload_files:" + kvAddress;
      const uploadFiles: UploadFile[] = await kv.lrange(filesKvKey, 0, -1);
      for (const uploadFile of uploadFiles) {
        result.push({
          cid: uploadFile.cid,
          uploadedAt: uploadFile.uploadedAt,
          uploadedBy: uploadFile.uploadedBy,
          fileName: uploadFile.fileName,
        });
      }
    }

    result.sort((a, b) => {
      return dayjs(b.uploadedAt).diff(dayjs(a.uploadedAt));
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("API error", error);
    res.status(500).send("Internal Server Error");
  }
}
