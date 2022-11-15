import { FC } from "react";
import { Movie } from "../models/Movie";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Textarea,
} from "@chakra-ui/react";
import * as Web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const MOVIE_REVIEW_PROGRAM_ID = "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN";

export const Form: FC = () => {
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const movie = new Movie(title, rating, message);
    handleTransactionSubmit(movie);
  };

  const handleTransactionSubmit = async (movie: Movie) => {
    if (!publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    const buffer = movie.serialize();
    const txn = new Web3.Transaction();

    const [pda] = await Web3.PublicKey.findProgramAddress(
      [publicKey.toBuffer(), new TextEncoder().encode(movie.title)],
      new Web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID)
    );

    const ixn = new Web3.TransactionInstruction({
      keys: [
        {
          // Your account will pay the fees so it's writing to the network
          pubkey: publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          // The PDA will store the review
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          // The system program is used to create the PDA
          pubkey: Web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buffer,
      programId: new Web3.PublicKey(MOVIE_REVIEW_PROGRAM_ID),
    });

    txn.add(ixn);
    try {
      let txnId = await sendTransaction(txn, connection);
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${txnId}?cluster=devnet`
      );
    } catch (error) {
      alert(JSON.stringify(error));
    }
  };

  return (
    <Box
      p={4}
      display={{ md: "flex" }}
      maxWidth="32rem"
      borderWidth={1}
      margin={2}
      justifyContent="center"
    >
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">Movie Title</FormLabel>
          <Input
            id="title"
            color="gray.400"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">Add your review</FormLabel>
          <Textarea
            id="review"
            color="gray.400"
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel color="gray.200">Rating</FormLabel>
          <NumberInput
            max={5}
            min={1}
            onChange={(valueString) => setRating(parseInt(valueString))}
          >
            <NumberInputField id="amount" color="gray.400" />
            <NumberInputStepper color="gray.400">
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Submit Review
        </Button>
      </form>
    </Box>
  );
};

