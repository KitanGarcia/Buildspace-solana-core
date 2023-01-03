use anchor_lang::prelude::*;

declare_id!("G4LM8Hm9jx29eYBi7cgoJ8pPjGsEGSv21CTirRCtndo3");

#[program]
pub mod movie_review {
    use super::*;

    pub fn add_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8
    ) -> Result<()> {
        msg!("Movie Account created");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}, rating");

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.reviewer = ctx.accounts.initializer.key();
        movie_review.title = title;
        movie_review.description = description;
        movie_review.rating = rating;
        Ok(())
    }

    pub fn update_movie_review(
        ctx: Context<AddMovieReview>,
        title: String,
        description: String,
        rating: u8
    ) -> Result<()> {
        msg!("Movie Account updated");
        msg!("Title: {}", title);
        msg!("Description: {}", description);
        msg!("Rating: {}, rating");

        let movie_review = &mut ctx.accounts.movie_review;
        movie_review.description = description;
        movie_review.rating = rating;
        Ok(())
    }

    pub fn close(_ctx: Context<Close>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct AddMovieReview<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = 8 + 32 + 1 + 4 + title.len() + description.len()
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct UpdateMovieReview<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), initializer.key().as_ref()],
        bump,
        realloc = 8 + 32 + 1 + 4 + title.len() + description.len(), // realloc since space will change with new data
        realloc::payer = initializer, // additional lamports required or refunded will come from or be sent to initializer
        realloc::zero = true // account may have allocated space shrunk or expanded multiple times 
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(
        mut,
        close = reviewer, // closing the account and refunding the rent to the reviewer
        has_one = reviewer // the reviewer account must match the reviewer in the Movie Review account 
    )]
    movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    reviewer: Signer<'info>
}


#[account]
pub struct MovieAccountState {
    pub reviewer: Pubkey, // 32
    pub rating: u8, // 1
    pub title: String, // 4 + len()
    pub description: String // 4 + len()
}

