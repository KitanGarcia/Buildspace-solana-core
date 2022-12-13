pub mod challenge_instruction;
use challenge_instruction::{StudentInstruction};

use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::AccountInfo
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let instruction = StudentInstruction::unpack(instruction_data)?;

    match instruction {
        StudentInstruction::AddStudent {name, message} => {
            add_student(program_id, accounts, name, message)
        }
    }
}

pub fn add_student(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: String,
    message: String
) -> ProgramResult {
    msg!("Adding student...");
    msg!("Name: {}", name);
    msg!("Message: {}", message);
    Ok(())
}
