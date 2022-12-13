use borsh::{BorshDeserialize};
use solana_program::{program_error::ProgramError};

pub enum StudentInstruction {
    AddStudent {
        name: String,
        message: String
    }
}

impl StudentInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // ? at end is short for returning an error and exiting the unpack function if the result
        // of split_first is an error. Like try/catch
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        // unwrap(): Give the result of the computation, but if there's an error, panic and stop
        // the program
        let payload = StudentPayload::try_from_slice(rest).unwrap();

        Ok(match variant {
            0 => Self::AddStudent {
                name: payload.name,
                message: payload.message
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}

// We need to specify types in the payload so Borsh knows where to split the bytes
#[derive(BorshDeserialize)]
struct StudentPayload {
    name: String,
    message: String
}


