import { publicKey } from "@/utils/keys/publicKey";
import { kv } from "@vercel/kv";
import { ethers } from "ethers";
import { File, IncomingForm } from "formidable";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
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
  const { address } = req.query;
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
    // ドメイン許可されているユーザ分だけ公開鍵を取得
    // TODO: ENSテキストレコードから取得するようにする
    //     const publicKeysArmored = [
    //       `-----BEGIN PGP PUBLIC KEY BLOCK-----

    // mQINBGVW3bABEACcjfKrNYZ43npm1TcHpmcXkARErBQ6imnRkuuBCiTiNaSe8Sc/
    // /3wmpr+BiGApepOqmKYTJBVmMK28HJdGWGxl/a7jrdJTgJdjRspkn9VBjmCDTJMe
    // mnym5CGz+Hxfa4ZYRo7/AGqBHOvq6rqLnwDw5p+dwlVQQBRh67H/HcZiugeE4kRf
    // sEKM/GQAd7H8AKllAo8L3rtM5PpQS7vu3PJ1/mTuLc6ytEdaY8jUu5j/oEgNnGST
    // mi64lmMRJzh4FVmfRfVWldiLql2gBxrWqh2zCR4XHkf2mQi5U4RuhBhTBnsM2Uos
    // +zYygNmrWrZ0ExBp4bORUv13o7iEZRVR+fj0lWbsIMG6qHKTohH8Dds6jFffir1W
    // maqqR1VyTgQpkv5J8Z1X8jo/Ed+EsnpWkQFf59+gOzeRDPDlX3wrWW2AxUQNwb/3
    // QPkEnyqZ2r40Y8CUHlV8bIsmAibfAy1Eg8dSG6oc6KOG37p1shy8y2EtokGsdETb
    // ZqqTXlG4fDEJWolXeI4YdxhZBe1G0aCi80XlUVO7obYEzwAdxhs/wFTTUZ3gJqJ7
    // Aj9eeD+6NrjAQpRuQExelQ+TW1aWMrRIc9lSsVnMaVNs1+5KhmaVwEZymVp/NQfq
    // Dug2gvg6HqplfegcJXlNXCkxTzUFhGwtRR+GOaeHKdjCHfMOC/LTIIw/swARAQAB
    // tCV1c2VyMSAodXNlcjEpIDx1c2VyMS5ldGhAYWRkcmVzcy5jb20+iQJRBBMBCAA7
    // FiEEge5p2D5KTpk0+q+3cK+RPTdkJYgFAmVW3bACGwMFCwkIBwICIgIGFQoJCAsC
    // BBYCAwECHgcCF4AACgkQcK+RPTdkJYj9SA/+NmMstkxIlzIiINeuZuolt9VwvdbA
    // boqdfTbmuU6BfMI4hvKbb5S9VQuAG5m4YObGQSHRFlEMfciow8u1VYhHbZpPPiyd
    // BlO/yDofMUjwfQRwO8lxcy2uGvTw3eYwX9lNCgQgn/0XR4aT4ffCJV1/1MdnZKI9
    // XQaZmr2ivnxizmf0L0tnfx3llhkUqhySrt8hVY1e497mNPeH42d0nULi048Wwizh
    // OfHeh/Ud4DsK+9jcHJpZYhtpYO4htG0KIIYVmBAdKTUB/p6j9vyL5itvfJBC+0l7
    // 0fIkBdhqSQEu9BR3cshYJ/h1S1Tu5PtmR2SUVMQZGhOuK7IarZ578pEVFx1Oe9r0
    // yjg8ZuFzcnB96AqVgKtZw0W1RbrhBPGwhfd4eNAFJ3Knul/yJE6y9d7rdq09FgMe
    // g3E4UBqOrRD46+jmd2J4GXmcXMihSFAmlAsnlOgD/sTC2O7y2PBr0z8RaAO5r98s
    // Qn29hQ/E3+5FUx4/Cw9qbpYMcLaio/z9dd0u1yqKlg51wAJ399VQhBa0cIyUC6Lb
    // LAwN5vfl4U0MvbrE4kkYdgbey4q/P5klqCAhmQGcMtl6HX83c3k/Kl5S6QhGzbI9
    // Qrw0V/0/mVnyJ6BU/YgDQtYWvZn+mgAdroVW7/cJBPejtWYxYi1zDoq0zpUatoZR
    // fKqS4kIdRRJKHFO5Ag0EZVbdsAEQAMYNzntxk9JaKzJVmLs3NMnNelm+CZaonbf7
    // 8fzyqiiKaAX6yppWs0qoDHDkYltNFp5J8NJm/VLv+00NOX/51UjA0LtAVb2r41TJ
    // vPV7m2cZsfocUk7HjNHPwbFbToqzkC1bDoIJq7nfsJcVNcdCxoerGxsTiiy+o4c2
    // 4w8L3nLURR1382pmUtXOdcDp0LGCR/E1Haf8q9dD6CM0l0vbCwE7FGGzrFJdXDYn
    // QLgYu/E42bGBrcNF7nH64Na6utR2j7O5dEdOiFV+sZlN1uiG/Nhbr9VTk0ybvs+s
    // IjYBXwMeHAJ02GEYn+Ndu4ws+zhcE/DDMfMOOmDc2ISiu2u3qb/8YBWtp7cQCagR
    // fyn8pwHXOTGXUcHHpdVpz2SlyFKeyOkVwZZJZeg1OYknxuiTOxp3CyZnExV4lrTZ
    // kXGC30bFpMz4KC8zZfVaMHsoPbzI2Rrn212PGEDSRYJnfUXNDlnUBXKlfuF+U/W6
    // xHxIQqz1m73HQWimAqK4GlAgogk92POOFytF3l+e/bcZvPEJirQw+jFl6fE1XgIs
    // t/+VzIkpxGsXXTeFvn2CYEdMjK5Nrubb5BW2qfG6pwl5QvAelnO9D2FpevA2sO0X
    // XhVH3NwBAe46okGWE7GCdxP3dH8p+rEU4cNKpgfFKruX1V2wg2JGb4xcMtLApkmU
    // dgQyLW05ABEBAAGJAjYEGAEIACAWIQSB7mnYPkpOmTT6r7dwr5E9N2QliAUCZVbd
    // sAIbDAAKCRBwr5E9N2QliIb3D/4qxjvy/sPHA5RQlzspCHddhmHICFNn8TI/vBKZ
    // mHTIn+E3QRd3s7qsw/GkJyULkj9pRJf5pSJQFg5W+fuyK3vOpSvB1j7SHpanz+BI
    // 6bXehWLuJKZmckvP9uQkvXYwpYJZZrOWNIlZf7e6p8yHbn0g/WQXjFAfGlr6CW75
    // CJz9gGacUzPnve9zkAlqds9Lz6o/2p+AV+OeNGYs7GotIg3jT7gCU611RWCKQY8T
    // EYkmyTEF37yqL648wSeyojjE6hQ8cZhY+uLLXjsuZo9woRACjWERHBatTsYXA6ZR
    // goC2JTW02XtH130tyzTR82P/5L0Se0IQZp4jr9hwObbwSMdKK8QGzhKiiLEmOJs2
    // yIs6GI42jIsafWVsLJXzURnKMc/psR1walsWF07MKyj4FzyFe0SaMkim49coI1T+
    // BBagml4b2ARfCktEpBMZMaUROvFFXgK4dr4SpwtiuIAkWJPIEmjp/mC6E2X1Mwgk
    // d8pgEqG8u/tDQSwUS6r7EA4RXUzfXp2N6iekoKajG+lMt9uILfM/ol96abknw8iX
    // ksxcB+fyvI32lWfA+d5VqOc8i2Sq9mzXu1uiBgT4AdalBz2CMUgzjWMEDT3jyFsw
    // svGe4LUSCQ6DsHpN7Holf6rAShbt7MqvO+Surtj6wUM4xkvMbVzV07eiSobg9Kec
    // bvZd7Q==
    // =n70D
    // -----END PGP PUBLIC KEY BLOCK-----`,
    //       `-----BEGIN PGP PUBLIC KEY BLOCK-----

    // xjMEZUkr8hYJKwYBBAHaRw8BAQdA8s0khfYmItPPbP8h36TDvvusdzvhFq/d
    // ZvHLRWazVoPNHXVzZXI1IDx1c2VyNS5ldGhAYWRkcmVzcy5jb20+wowEEBYK
    // AD4FgmVJK/IECwkHCAmQ9KSf9d1wGsgDFQgKBBYAAgECGQECmwMCHgEWIQSD
    // BJVRfwwhks7hSzn0pJ/13XAayAAAe3cA/RIh6qqp598Q6yxh4e1Lv0e/9wVk
    // ti17OrqHYMvydLTyAP9ZteKZfgzDI7q6JftH+qxZN2/q3etLzlEclTr1O7VZ
    // Cc44BGVJK/ISCisGAQQBl1UBBQEBB0AlxOpxvzObl5NAVzGTeN/8f3xgS5y+
    // +bRZm84+5k3lWgMBCAfCeAQYFgoAKgWCZUkr8gmQ9KSf9d1wGsgCmwwWIQSD
    // BJVRfwwhks7hSzn0pJ/13XAayAAAUTEBAOVfoFBC61Iyl7hCslw29MdbCLb4
    // jizfGuIwBhFBlP8hAP9MgdHH00RXswEqWqtiYMgbXo7Dv+zHejNPADLbl0ng
    // DQ==
    // =1bt7
    // -----END PGP PUBLIC KEY BLOCK-----`
    //     ];
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
    const uploadDir = await provider.lookupAddress(address as string);
    console.log(uploadDir);

    const tempDir = path.join(__dirname, uploadDir as string);
    const tempFilePath = path.join(tempDir, originalFilename);
    await fs.mkdir(tempDir, { recursive: true });

    // 暗号化されたデータを一時ファイルに書き込む
    await fs.writeFile(tempFilePath, new Uint8Array(encrypted));

    // getFilesFromPathを使用してファイルを読み込む
    const filesToUpload = await getFilesFromPath(tempDir);

    // Web3.Storageにアップロード
    const cid = await client.put(filesToUpload);

    // Vercel KV に保存した値を書き込む
    const filesKvKey = "upload_files:" + address;
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
