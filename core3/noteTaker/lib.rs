// To be used in Solana Playground. Partially finished backbone. Will not work

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize)]
struct NoteInstructionPayload {
    id: u64,
    title: String,
    body: String
}

impl NoteInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result(Self, ProgramError) { // Returns a NoteInstruction or an error
        // Take the first byte as the variant to determine which instruction to execute
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        // Deserialize the rest of the input (separated from the first byte)
        let payload = NoteInstructionPayload::try_from_slice(rest).unwrap(); // unwrap returns value if not an error

        // Match the variant to determine which data struct is expected by
        // the function and return the TestStruct or an error
        // Like a switch statement!
        Ok(match variant {
            0 => Self::CreateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id
            },
            1 => Self::UpdateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id
            },
            2 => Self::DeleteNote {
                id: payload.id
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data&[u8]
) -> ProgramResult {
    // Call unpack to deserialize instruction data
    let instruction = NoteInstruction::unpack(instruction_data)?;

    // Match the returned data struct to what you expect
    match instruction {
        NoteInstruction::CreateNote {title, body, id} => {
            // Execute program to create a note
        }
        NoteInstruction::UpdateNote {title, body, id} => {
            // Execute program to update a note
        }
        NoteInstruction::DeleteNote {id} => {
            // Execute program to delete a note
        }
    }
}
