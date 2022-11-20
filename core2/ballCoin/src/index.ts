import { initializeKeypair } from "./initializeKeypair";
import * as Web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import * as fs from "fs";

// Creates token mint and returns mint's address
async function createNewMint(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  mintAuthority: Web3.PublicKey,
  freezeAuthority: Web3.PublicKey,
  decimals: number
): Promise<Web3.PublicKey> {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(`The token mint account address is ${tokenMint}`);
  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );
  return tokenMint;
}

// Creates the associated token account
// Payer and owner can be different. You can pay to create someone else's account
// (and pay their rent)
async function createTokenAccount(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  mint: Web3.PublicKey,
  owner: Web3.PublicKey
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );

  console.log(
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  );

  return tokenAccount;
}

async function mintTokens(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  mint: Web3.PublicKey,
  destination: Web3.PublicKey,
  authority: Web3.Keypair,
  amount: number
) {
  const mintInfo = await token.getMint(connection, mint);

  const txnSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount * 10 ** mintInfo.decimals
  );

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`
  );
}

async function transferTokens(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  source: Web3.PublicKey,
  destination: Web3.PublicKey,
  owner: Web3.PublicKey,
  amount: number,
  mint: Web3.PublicKey
) {
  const mintInfo = await token.getMint(connection, mint);

  const txnSignature = await token.transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount * 10 ** mintInfo.decimals
  );

  console.log(
    `Transfer Transaction: https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`
  );
}

async function burnTokens(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  account: Web3.PublicKey,
  mint: Web3.PublicKey,
  owner: Web3.Keypair,
  amount: number
) {
  const txnSignature = await token.burn(
    connection,
    payer,
    account,
    mint,
    owner,
    amount
  );
  console.log(
    `Burn Transaction: https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`
  );
}

async function main() {
  const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  const MINT_ADDRESS = "2rVuJMd7a3Tk5Nq37v5BQyZ8CULLk66jECgv3w28fZZe";

  // Metaplex setup
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  await createTokenMetadata(
    connection,
    metaplex,
    new Web3.PublicKey(MINT_ADDRESS),
    user,
    "Ball",
    "BAL",
    "The holder of this token has the honor of facing me in the field of ball"
  );

  /*
  // Creates token and mint. Run before the above
  const mint = await createNewMint(
    connection,
    user, // We'll pay the fees
    user.publicKey, // We're the mint authority
    user.publicKey, // We're the freeze authority
    2 // Only 2 decimals
  );

  const tokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    user.publicKey // Associating our address with the token account
  );

  await mintTokens(connection, user, mint, tokenAccount.address, user, 100);

  const receiver = Web3.Keypair.generate().publicKey;
  const receiverTokenAccount = await createTokenAccount(
    connection,
    user,
    mint,
    receiver
  );

  await transferTokens(
    connection,
    user,
    tokenAccount.address,
    receiverTokenAccount.address,
    user.publicKey,
    50,
    mint
  );

  await burnTokens(connection, user, tokenAccount.address, mint, user, 25);
  */
}

async function createTokenMetadata(
  connection: Web3.Connection,
  metaplex: Metaplex,
  mint: Web3.PublicKey,
  user: Web3.Keypair,
  name: string,
  symbol: string,
  description: string
) {
  // File to buffer
  const buffer = fs.readFileSync("src/assets/ball.png");

  // Buffer to metaplex file
  const file = toMetaplexFile(buffer, "ball.png");

  // Upload image and get image URI
  const imageUri = await metaplex.storage().upload(file);
  console.log("Image URI:", imageUri);

  // Upload metadata and get metadata URI (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });

  console.log("Metadata URI:", uri);

  // Get metadata account address
  const metadataPDA = metaplex.nfts().pdas().metadata({ mint });

  // On-chain metadata format
  const tokenMetadata = {
    name: name,
    symbol: symbol,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  // Transaction to create metadata account
  const txn = new Web3.Transaction().add(
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: mint,
        mintAuthority: user.publicKey,
        payer: user.publicKey,
        updateAuthority: user.publicKey,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
  );

  const txnSignature = await Web3.sendAndConfirmTransaction(connection, txn, [
    user,
  ]);

  console.log(
    `Create Metadata Account: https://explorer.solana.com/tx/${txnSignature}?cluster=devnet`
  );
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
