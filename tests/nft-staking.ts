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
  const stake_token = Keypair.generate();
  let mint: PublicKey;
  let mint_ata: any;
  // let farmLink: PublicKey;

  const config_account = PublicKey.findProgramAddressSync(
    [Buffer.from("config", "utf-8")],
    program.programId
  )[0];
  const user_account = PublicKey.findProgramAddressSync(
    [Buffer.from("user", "utf-8"), user.publicKey.toBuffer()],
    program.programId
  )[0];
  const rewards_mint = getAssociatedTokenAddressSync(
    stake_token.publicKey,
    config_account,
    true
  );
  const rewards_ata = getOrCreateAssociatedTokenAccount(
    connection,
    admin,
    rewards_mint,
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
      config_account.toBuffer(),
    ],
    program.programId
  )[0];

  const accountsPublicKeys = {
    user: user.publicKey,
    stake_token: stake_token.publicKey,
    config_account,
    user_account,
    rewards_mint,
    associatedTokenprogram: ASSOCIATED_TOKEN_PROGRAM_ID,

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
    
      mint_ata = await getOrCreateAssociatedTokenAccount(
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
      //     newAccountPubkey: stake_token.publicKey,
      //     lamports,
      //     space: MINT_SIZE,
      //     programId: TOKEN_PROGRAM_ID,
      //   }),
      //   createInitializeMint2Instruction(
      //     stake_token.publicKey,
      //     6,
      //     nft_staking.publicKey,
      //     null
      //   ),
      //   createAssociatedTokenAccountIdempotentInstruction(
      //     provider.publicKey,
      //     rewards_ata,
      //     nft_staking.publicKey,
      //     stake_token.publicKey
      //   ),
      //   createMintToInstruction(
      //     stake_token.publicKey,
      //     rewards_ata,
      //     nft_staking.publicKey,
      //     1000000000
      //   ),
      // ];
      // await provider.sendAndConfirm(tx, [stake_token, user]).then(log);
    } catch (error) {
      console.error(error);
    }
  });

  // it("initialize_config", async () => {
  //   const accounts = {
  //     admin: accountsPublicKeys["user"],
  //     configAccount: accountsPublicKeys["config_account"],
  //     rewardsMint: accountsPublicKeys["stake_token"],
  //     systemProgram: accountsPublicKeys["system_program"],
  //     tokenProgram: accountsPublicKeys["token_program"],
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
