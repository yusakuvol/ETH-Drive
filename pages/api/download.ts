import { NextApiRequest, NextApiResponse } from 'next';
import { Web3Storage } from 'web3.storage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const storageApiKey = process.env.WEB3_STORAGE_API_KEY || "";
  if (!storageApiKey) {
    res.status(500).json({ error: 'Web3.Storage API key is not set.' });
    return;
  }

  // クエリからCIDとファイルパスを取得する
  const { cid, filePath } = req.query;

  if (!cid || !filePath || typeof cid !== 'string' || typeof filePath !== 'string') {
    res.status(400).json({ error: 'CID and filePath must be provided.' });
    return;
  }

  try {
    const client = new Web3Storage({ token: storageApiKey });

    // CIDを使用してファイルを取得する
    const response = await client.get(cid);
    if (!response.ok) {
      throw new Error(`Failed to get file from Web3.Storage: ${response.statusText}`);
    }

    // ストリームとしてファイルを読み込む
    const files = await response.files();
    const file = files.find(f => f.name === filePath);

    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    // ファイルをダウンロードとしてクライアントに送信する
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(file.name)}`);
    res.setHeader('Content-Length', file.size.toString());

    // ファイルのストリームをレスポンスにパイプする
    const fileStream = await file.arrayBuffer();
    res.write(Buffer.from(fileStream));
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while downloading the file.' });
  }
}
