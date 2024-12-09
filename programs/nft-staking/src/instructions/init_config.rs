use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

use crate::state::StakeConfig;

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init, 
        payer = admin,
        seeds = [b"config".as_ref()],
        bump,
        space = StakeConfig::INIT_SPACE,
    )]
    pub config_account: Account<'info, StakeConfig>,
    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"rewards".as_ref(), config_account.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = config_account,
    )]
    pub rewards_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitConfig<'info> {
    pub fn initialize_config(&mut self, points_per_stake: u8, max_stake: u8, freeze_period: u32, bumps: &InitConfigBumps) -> Result<()> {
        self.config_account.set_inner(StakeConfig {
            points_per_stake,
            max_stake,
            freeze_period,
            rewards_bump: bumps.rewards_mint,
            bump: bumps.config_account,
        });

        Ok(())
    }
}