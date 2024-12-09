use anchor_lang::prelude::*;

declare_id!("HTZ275L8mFESgZSXo4b3EJAp45fgchDkrZEw8fY2UK8x");

#[program]
pub mod nft_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
