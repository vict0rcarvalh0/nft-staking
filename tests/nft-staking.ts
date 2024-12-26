import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMint2Instruction,
  createMint,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import { NftStaking } from "../target/types/nft_staking";

const METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("NFT Staking", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider();

  const connection = provider.connection;

  const program = anchor.workspace.NftStaking as Program<NftStaking>;

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };

  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };

  // Accounts
  const user = Keypair.generate();
  const admin = Keypair.generate();
  const stakeToken = Keypair.generate();
  let mint: PublicKey;
  let mintAta: any;

  const configAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("config", "utf-8")],
    program.programId
  )[0];
  const userAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("user", "utf-8"), user.publicKey.toBuffer()],
    program.programId
  )[0];
  const rewardsMint = getAssociatedTokenAddressSync(
    stakeToken.publicKey,
    configAccount,
    true
  );
  const rewardsAta = getOrCreateAssociatedTokenAccount(
    connection,
    admin,
    rewardsMint,
    admin.publicKey
  );

  const metadataAccount = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  )[0];

  const masterEditionAccount = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("master_edition"),
    ],
    METADATA_PROGRAM_ID
  )[0];

  const stakeAccount = PublicKey.findProgramAddressSync(
    [
      Buffer.from("stake"),
      mint.toBuffer(),
      configAccount.toBuffer(),
    ],
    program.programId
  )[0];

  const accountsPublicKeys = {
    user: user.publicKey,
    stakeToken: stakeToken.publicKey,
    configAccount,
    userAccount,
    rewardsMint,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };

  it("setup", async () => {
    try {
      mint = await createMint(
        connection,
        user,
        user.publicKey,
        null,
        6
      );
    
      mintAta = await getOrCreateAssociatedTokenAccount(
        connection,
        user,
        mint,
        user.publicKey
      );
      // let lamports = await getMinimumBalanceForRentExemptMint(connection);
      // let tx = new Transaction();
      // tx.instructions = [
      //   SystemProgram.transfer({
      //     fromPubkey: provider.publicKey,
      //     toPubkey: user.publicKey,
      //     lamports: 10 * LAMPORTS_PER_SOL,
      //   }),
      //   SystemProgram.createAccount({
      //     fromPubkey: provider.publicKey,
      //     newAccountPubkey: stakeToken.publicKey,
      //     lamports,
      //     space: MINT_SIZE,
      //     programId: TOKEN_PROGRAM_ID,
      //   }),
      //   createInitializeMint2Instruction(
      //     stakeToken.publicKey,
      //     6,
      //     nftStaking.publicKey,
      //     null
      //   ),
      //   createAssociatedTokenAccountIdempotentInstruction(
      //     provider.publicKey,
      //     rewardsAta,
      //     nftStaking.publicKey,
      //     stakeToken.publicKey
      //   ),
      //   createMintToInstruction(
      //     stakeToken.publicKey,
      //     rewardsAta,
      //     nftStaking.publicKey,
      //     1000000000
      //   ),
      // ];
      // await provider.sendAndConfirm(tx, [stakeToken, user]).then(log);
    } catch (error) {
      console.error(error);
    }
  });

  // it("initializeConfig", async () => {
  //   const accounts = {
  //     admin: accountsPublicKeys["user"],
  //     configAccount: accountsPublicKeys["configAccount"],
  //     rewardsMint: accountsPublicKeys["stakeToken"],
  //     systemProgram: accountsPublicKeys["systemProgram"],
  //     tokenProgram: accountsPublicKeys["tokenProgram"],
  //   };
  //   await program.methods
  //     .initializeConfig(null, null, null)
  //     .accounts({ ...accounts })
  //     .signers([admin])
  //     .rpc()
  //     .then(confirm)
  //     .then(log);
  // });
});
