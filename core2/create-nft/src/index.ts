import { initializeKeypair } from "./initializeKeypair";
import * as Web3 from "@solana/web3.js";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
} from "@metaplex-foundation/js";
import * as fs from "fs";

const tokenName = "Token Name";
const description = "Description";
const symbol = "SYMBOL";
const sellerFeeBasisPoints = 100;
const imageFile = "test.png";

const createNft = async (
  metaplex: Metaplex,
  uri: string
): Promise<NftWithToken> => {
  const { nft } = await metaplex.nfts().create({
    uri: uri,
    name: tokenName,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    symbol: symbol,
  });

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );

  return nft;
};

async function main() {
  const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  // Create metaplex instance
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // File to buffer
  const buffer = fs.readFileSync(`src/${imageFile}`);

  // Buffer to metaplex file
  const file = toMetaplexFile(buffer, imageFile);

  // Upload image and get image URI
  const imageUri = await metaplex.storage().upload(file);
  console.log(`Image URI: ${imageUri}`);

  // Upload metadata and get metadata URI (off-chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: tokenName,
    description: description,
    image: imageUri,
  });

  console.log("Metadata uri:", uri);

  await createNft(metaplex, uri);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
