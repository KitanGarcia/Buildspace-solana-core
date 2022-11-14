import type { NextPage } from "next";
import { useState } from "react";
import * as web3 from "@solana/web3.js";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import AddressForm from "../components/AddressForm";

const Home: NextPage = () => {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [isExecutable, setIsExecutable] = useState(false);

  const addressSubmittedHandler = async (address: string) => {
    try {
      setAddress(address);

      // Convert the string to a public key
      const key = new web3.PublicKey(address);

      // Connect to devnet
      const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

      // Retrieve on-chain balance and store in state
      connection.getBalance(key).then((balance) => {
        setBalance(balance / web3.LAMPORTS_PER_SOL);
      });

      // Check if account is an executable account
      const info = await connection.getAccountInfo(key);
      setIsExecutable(info ? info.executable : false);
    } catch (error) {
      setAddress("");
      setBalance(0);
      alert(error);
    }
  };

  return (
    <div className={styles.App}>
      <header className={styles.AppHeader}>
        <p>Start Your Solana Journey</p>
        <AddressForm handler={addressSubmittedHandler} />
        <p>{`Address: ${address}`}</p>
        <p>{`Balance: ${balance} SOL`}</p>
        <p>{`Is it executable: ${isExecutable ? "Yup" : "Nope"}`}</p>
      </header>
    </div>
  );
};

export default Home;
