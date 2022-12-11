// To be run in Solana Playground

use solana_program::{
    account_info::AccountInfo, // general purpose descriptor for Solana, defining all properties an account should have
    entrypoint, // imports entrypoint! macro (like main()) to run our instructions
    entrypoint::ProgramResult, // Rust enum representing the result of a Solana program execution
    pubkey::Pubkey,
    msg
};

entrypoint!(process_instruction); // call process_instruction

pub fn process_instruction(
    // Arguments and their types
    // Tip: prepend variables with _ if they are unused in the function
    _program_id: &Pubkey, // pubkey of program account; required to verify program is being called by the correct account
    _accounts: &[AccountInfo], // array (of unknown length) of accounts the instruction touches
    _instruction_data: &[u8] // array (of unknown length) of 8-bit instruction data from our transaction
    // Return type
) -> ProgramResult {
    msg!("Hello World!");
    Ok(())
}
