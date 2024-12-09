use anchor_lang::prelude::*;

mod state;
mod instructions;
mod errors;

pub use state::*;
pub use instructions::*;
pub use errors::*;

declare_id!("HTZ275L8mFESgZSXo4b3EJAp45fgchDkrZEw8fY2UK8x");

#[program]
pub mod nft_staking {
    use super::*;

    pub fn initialize_config(ctx: Context<InitConfig>, points_per_stake: u8, max_stake: u8, freeze_period: u32) -> Result<()> {
        ctx.accounts.initialize_config(points_per_stake, max_stake, freeze_period, &ctx.bumps)
    }

    pub fn initialize_user(ctx: Context<InitUser>) -> Result<()> {
        ctx.accounts.initialize_user(&ctx.bumps)
    }

    pub fn stake(ctx: Context<Stake>) -> Result<()> {
        ctx.accounts.stake(&ctx.bumps)
    }

    pub fn unstake(ctx: Context<Unstake>) -> Result<()> {
        ctx.accounts.unstake()
    }

    pub fn claim_rewards(ctx: Context<Claim>) -> Result<()> {
        ctx.accounts.claim()
    }
}
