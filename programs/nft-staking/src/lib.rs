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

    // pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
    //     Ok(())
    // }
}
