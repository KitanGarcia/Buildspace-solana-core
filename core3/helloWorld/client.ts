// To be run in Solana Playground

// Program ID of deployed program on playground
const programId = new web3.PublicKey(
  "J4sCQsbSPEieJGeAGzToxTo2JFnYRo4pBxrn5r8GXS3K"
);

async function sayHello(
  payer: web3.Keypair
): Promise<web3.TransactionSignature> {
  const transaction = new web3.Transaction();
  const instruction = new web3.TransactionInstruction({
    keys: [], // We're not using any accounts yet
    programId,
    // No need to add data here
  });

  transaction.add(instruction);

  const transactionSignature = await web3.sendAndConfirmTransaction(
    pg.connection,
    transaction,
    [payer]
  );

  return transactionSignature;
}

async function main() {
  const transactionSignature = await sayHello(pg.wallet.keypair);
  console.log(
    `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

main();