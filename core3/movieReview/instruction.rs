use borsh::{BorshDeserialize};
use solana_program::{program_error::ProgramError};

pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    }
}

impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // ? at end is short for returning an error and exiting the unpack function if the result
        // of split_first is an error. Like try/catch
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        // unwrap(): Give the result of the computation, but if there's an error, panic and stop
        // the program
        let payload = MovieReviewPayload::try_from_slice(rest).unwrap();

        Ok(match variant {
            0 => Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description
            },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}

// We need to specify types in the payload so Borsh knows where to split the bytes
#[derive(BorshDeserialize)]
struct MovieReviewPayload {
    title: String,
    rating: u8,
    description: String
}
