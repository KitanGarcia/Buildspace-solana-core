pub mod instruction;
pub mod state;
use instruction::{MovieInstruction};
use state::{MovieAccountState};
use borsh::BorshSerialize;

use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::{next_account_info, AccountInfo},
    system_instruction,
    program_error::ProgramError,
    sysvar::{rent::Rent, Sysvar},
    program::{invoke_signed},
    borsh::try_from_slice_unchecked,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let instruction = MovieInstruction::unpack(instruction_data)?;

    match instruction {
        MovieInstruction::AddMovieReview {title, rating, description} => {
            add_movie_review(program_id, accounts, title, rating, description)
        }
    }
}

pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    // Get Account iterator
    let account_info_iter  = &mut accounts.iter();

    // Get accounts
    // next_account_info takes an iterator and returns the next item in the list
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Derive PDA from initializer's pubkey and movie title
    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);


    // Calculate size required
    let account_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());

    // Calculate rent required
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    // Create the account
    invoke_signed(
        // create account instruction
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id
        ),
        // the account we're using
        &[initializer.clone(), pda_account.clone(), system_program.clone()],
        // the seeds we use to derive the PDA
        &[&[initializer.key.as_ref(), title.as_bytes().as_ref(), &[bump_seed]]],
    )?;

    msg!("PDA created: {}", pda);
    msg!("Unpacking state account");

    // Convert raw bytes into Rust type
    let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("Borrowed account data");

    // Update data
    account_data.title = title;
    account_data.rating = rating;
    account_data.description = description;
    account_data.is_initialized = true;

    msg!("Serializing account");
    // Serialize data back into raw bytes
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("State account serialized");


    msg!("Title: {}", account_data.title);
    msg!("Description: {}", account_data.description);
    msg!("Rating: {}", account_data.rating);
    Ok(())
}
