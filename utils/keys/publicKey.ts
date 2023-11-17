import { ethers, EnsResolver } from "ethers";

const INFURA_ENDPOINT = "https://mainnet.infura.io/v3/3d5f00f9a10e4c74ada2d617dd948857";
const provider = new ethers.JsonRpcProvider(INFURA_ENDPOINT);

export class PublicKey {
  public async getPublicKeys(): Promise<string[]> {
    const publicKeys: string[] = [];
    const addresses = [
      "0x05942740eaF85Ac8C04642e0Edc11Ab1F36313b7",
      "0x935F7efCe45DBD80fb880032d6E7ba98a0656cDE"
    ];

    for (const address of addresses) {
      try {
        const publicKey = await this.getENSPublicKeyFromENS(address);
        publicKeys.push(this.formatPublicKey(publicKey));
      } catch (error) {
        console.error(error);
      }
    }
  
    return publicKeys;
  }

  private async getENSPublicKeyFromENS(address: string): Promise<string> {
    // ウォレットアドレスからENSドメイン名を取得
    const ensName = await provider.lookupAddress(address);
    if (!ensName) throw new Error("Missing name");
  
    // 逆名前解決して、ENSドメインが正しいことを確認
    const reverseAddress = await provider.resolveName(ensName);
    if (
      !reverseAddress ||
      reverseAddress !== address
    ) throw new Error("Missing address");
  
    // ENSドメイン名からテキストレコードを取得
    const resolver: EnsResolver = await provider.getResolver(ensName);
    if (!resolver) throw new Error("Missing resolver");
  
    // 'PUBLIC_KEY' テキストレコードを取得
    const publicKey = await resolver.getText("PUBLIC_KEY");
    if (!publicKey) throw new Error("Missing publicKey");
    return publicKey;
  }

  private formatPublicKey(publicKey: string): string {
    // ヘッダー・フッターを削除
    const header = '-----BEGIN PGP PUBLIC KEY BLOCK-----';
    const footer = '-----END PGP PUBLIC KEY BLOCK-----';
    let output = publicKey.replace(header + '  ', '');
    output = output.replace(' ' + footer, '');

    // 半角で改行して
    output = output.replace(/ /g, '\n');

    // 最後に、ヘッダー・フッター を加える
    output = header + '\n\n' + output + '\n' + footer;

    return output;
  }
}

export const publicKey = new PublicKey();
