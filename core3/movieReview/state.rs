use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    program_pack::{IsInitialized, Sealed},
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    pub is_initialized: bool,
    pub rating: u8,
    pub title: String,
    pub description: String
}

// Specifies that MovieAccountState has a known size and provides for some compiler
// optimizations
impl Sealed for MovieAccountState {}

// Checks the is_initialized field on the MovieAccountState struct
impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
