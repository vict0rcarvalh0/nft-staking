import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SendTransactionError
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
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
    stake_token: stakeToken.publicKey,
    stake_account: stakeAccount,
    config_account: configAccount,
    user_account: userAccount,
    rewards_mint: rewardsMint,
    rewards_ata: rewardsAta,
    metadata_account: metadataAccount,
    master_edition_account: masterEditionAccount,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenProgram: TOKEN_PROGRAM_ID,
    metadataProgram: METADATA_PROGRAM_ID,
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
    } catch (error) {
      console.error(error);
    }
  });

  it("initialize config", async () => {
    const accounts = {
      admin: accountsPublicKeys["user"],
      configAccount: accountsPublicKeys["config_account"],
      rewardsMint: accountsPublicKeys["stake_token"],
      systemProgram: accountsPublicKeys["system_program"],
      tokenProgram: accountsPublicKeys["token_program"],
    };

    try {
        await program.methods
          .initializeConfig(1, 10, 30)
          .accounts(accounts)
          .signers([user])
          .rpc()
          .then(confirm)
          .then(log);
      }
     catch (error) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(provider.connection);
        console.log("Transaction Logs:", logs);
      }
      console.error("Error initializing farmlink:", error);
      throw error;
    }
  })

  it("initialize user", async () => {
    const accounts = {
      user: accountsPublicKeys["user"],
      userAccount: accountsPublicKeys["user_account"],
      systemProgram: accountsPublicKeys["system_program"],
    };

    try {
        await program.methods
          .initializeUser()
          .accounts(accounts)
          .signers([user])
          .rpc()
          .then(confirm)
          .then(log);
      }
     catch (error) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(provider.connection);
        console.log("Transaction Logs:", logs);
      }
      console.error("Error initializing farmlink:", error);
      throw error;
    }
  })

  it("stake", async () => {
    const accounts = {
      user: accountsPublicKeys["user"],
      mint: accountsPublicKeys["mint"],
      mintAta: accountsPublicKeys["mint_ata"],
      metadataAccount: accountsPublicKeys["metadata_account"],
      masterEditionAccount: accountsPublicKeys["master_edition_account"],
      configAccount: accountsPublicKeys["config_account"],
      stakeAccount: accountsPublicKeys["stake_account"],
      userAccount: accountsPublicKeys["user_account"],
      systemProgram: accountsPublicKeys["system_program"],
      tokenProgram: accountsPublicKeys["token_program"],
      metadataProgram: accountsPublicKeys["metadata_program"],
    };

    // pub collection_mint: Account<'info, Mint>,

    try {
        await program.methods
          .stake()
          .accounts(accounts)
          .signers([user])
          .rpc()
          .then(confirm)
          .then(log);
      }
     catch (error) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(provider.connection);
        console.log("Transaction Logs:", logs);
      }
      console.error("Error initializing farmlink:", error);
      throw error;
    }
  })

  it("unstake", async () => {
    const accounts = {
      user: accountsPublicKeys["user"],
      mint: accountsPublicKeys["mint"],
      mintAta: accountsPublicKeys["mint_ata"],
      configAccount: accountsPublicKeys["config_account"],
      stakeAccount: accountsPublicKeys["stake_account"],
      userAccount: accountsPublicKeys["user_account"],
      tokenProgram: accountsPublicKeys["token_program"],
      metadataProgram: accountsPublicKeys["metadata_program"],
      masterEditionAccount: accountsPublicKeys["master_edition_account"],
    };

    try {
        await program.methods
          .unstake()
          .accounts(accounts)
          .signers([user])
          .rpc()
          .then(confirm)
          .then(log);
      }
     catch (error) {
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(provider.connection);
        console.log("Transaction Logs:", logs);
      }
      console.error("Error initializing farmlink:", error);
      throw error;
    }
  })
});
