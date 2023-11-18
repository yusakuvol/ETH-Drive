import { authOptions } from "@/utils/authOption/authOption";
import { publicKey } from "@/utils/keys/publicKey";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { File, IncomingForm } from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import * as openpgp from "openpgp";
import path from "path";
import { Web3Storage, getFilesFromPath } from "web3.storage";

const STORAGE_API_KEY = process.env.WEB3_STORAGE_API_KEY || "";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // POSTリクエスト以外は許可しない
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  const walletAddress = session?.user?.name;

  if (!walletAddress) {
    res.status(401).send("Unauthorized");
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, _, files) => {
    if (err) {
      return res.status(400).json({ error: "Failed to process the image." });
    }

    const client = new Web3Storage({ token: STORAGE_API_KEY });
    const file = files.image && (files.image[0] as File);

    if (!file || !file.filepath || !file.originalFilename) {
      return res
        .status(400)
        .json({ error: "No file provided or file path is missing." });
    }

    // 公開鍵
    const publicKeysArmored = await publicKey.getPublicKeys();

    // ファイルを読み込む
    const fileData = await fs.readFile(file.filepath);
    const fileMessage = await openpgp.createMessage({ binary: fileData });

    // ファイルを暗号化する
    // 共有鍵(一時的なセッションキー)は1つだが、
    // 暗号化した共有鍵は、公開鍵の数だけ(つまりドメイン許可されたユーザ数だけ)作成される
    // こうすることで、他ユーザが暗号化したファイルであっても、復元可能になる
    const publicKeys = await Promise.all(
      publicKeysArmored.map((armoredKey) => openpgp.readKey({ armoredKey }))
    );
    const encrypted: any = await openpgp.encrypt({
      message: fileMessage,
      encryptionKeys: publicKeys,
      format: "binary",
    });

    // 一時ディレクトリを作成
    const originalFilename = file.originalFilename;
    const rpcUrl =
      "https://mainnet.infura.io/v3/3d5f00f9a10e4c74ada2d617dd948857";
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const uploadDir = await provider.lookupAddress(walletAddress);

    const tempDir = path.join("/tmp", uploadDir as string);
    const tempFilePath = path.join(tempDir, originalFilename);
    await fs.mkdir(tempDir, { recursive: true });

    // 暗号化されたデータを一時ファイルに書き込む
    await fs.writeFile(tempFilePath, new Uint8Array(encrypted));

    // getFilesFromPathを使用してファイルを読み込む
    const filesToUpload = await getFilesFromPath(tempDir);

    // Web3.Storageにアップロード
    const cid = await client.put(filesToUpload);

    // Vercel KV に保存した値を書き込む
    const filesKvKey = `upload_files:${walletAddress}`;
    const uploadedAt = new Date().toISOString();
    await kv.lpush(filesKvKey, {
      cid: cid.toString(),
      uploadedAt: uploadedAt,
      uploadedBy: uploadDir,
      fileName: originalFilename,
    });

    // 一時ディレクトリのクリーンアップ
    await fs.unlink(tempFilePath);

    res.status(200).json({
      cid: cid.toString(),
      uploadedAt: uploadedAt,
      uploadedBy: uploadDir,
      fileName: originalFilename,
    });
  });
}
