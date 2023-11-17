import type { NextApiRequest, NextApiResponse } from 'next';
import * as openpgp from 'openpgp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GETリクエスト以外は許可しない
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // PGPキーペアの生成
    const { privateKey, publicKey } = await openpgp.generateKey({
      type: 'ecc',
      curve: 'curve25519',
      userIDs: [{
        name: 'yusakuvol', // ユーザー名
        email: 'yusakuvol.eth@address.com' // ENDドメイン@address.com の形式で指定。@address.comがないと形式エラーになる
      }],
      format: 'armored'
    });

    console.log(privateKey);
    console.log(publicKey);

    // TODO: 公開鍵は、ENSテキストレコードに登録する
    // TODO: 秘密鍵は1度だけブラウザに表示させたいので、DBの表示フラグを立てる

    // 秘密鍵と公開鍵をレスポンスとして返却
    // 改行箇所は、\n とかでなく、見た目上で改行されてないと正しく暗号化/復号できないので注意
    res.status(200).json({
      privateKey: privateKey,
      publicKey: publicKey,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
