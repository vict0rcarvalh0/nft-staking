use anchor_lang::error_code;

#[error_code]
pub enum StakeError {
    #[msg("Freeze period not passed!")]
    FreezePeriodNotOver,
    #[msg("Maximum stake reached!")]
    MaxStakeReached,
}