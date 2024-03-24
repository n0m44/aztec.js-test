import React, { useState } from 'react';
import deployerEnv from '../config';

import { AztecAddress, Contract, Fr } from '@aztec/aztec.js';
import { toast, useToast } from 'react-toastify';
import { TestTokenContract } from '../artifacts/TestToken';

export function useTestTokenContract() {
  const [wait, setWait] = useState(false);
  const [contract, setContract] = useState<TestTokenContract | undefined>();

  const connectToContractByAddress = async (address: string) => {
    console.log('address:', address);
    const aztecAddress = AztecAddress.fromString(address);

    console.log('aztecAddress:', aztecAddress);

    deployerEnv.getWallet().then(async wallet => {
      const tokenContract = await TestTokenContract.at(aztecAddress, wallet).catch(console.error);
      if (tokenContract) {
        setContract(tokenContract);
      } else {
        localStorage.removeItem('tokenContractAddress');
      }
    });
  };

  React.useEffect(() => {
    const storedContractAddress = localStorage.getItem('tokenContractAddress');

    if (!storedContractAddress || contract) {
      return;
    }

    connectToContractByAddress(storedContractAddress);
  }, []);

  React.useEffect(() => {
    if (contract) {
      localStorage.setItem('tokenContractAddress', contract!.address.toString());
    }
  }, [contract]);

  const mint = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setWait(true);
    const wallet = await deployerEnv.getWallet();

    const sendMint = contract?.methods.mint(9999, wallet.getAddress()).send();

    if (!sendMint) {
      toast.error('Error on create mint');
      setWait(false);
      return;
    }

    toast.promise(sendMint.wait(), {
      error: {
        render: ({ data }) => {
          console.error(data);
          return 'Error on mint';
        },
      },
      pending: 'Pending on mint',
      success: { render: ({ data }) => `Mint status: ${data.status}. Tx: ${data.txHash.toString()}` },
    });

    setWait(false);
  };

  const getBalance = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setWait(true);
    const wallet = await deployerEnv.getWallet();

    const viewBalance = contract?.methods.getBalance(wallet.getAddress()).view();

    if (!viewBalance) {
      toast.error('Error on create view on balance');
      setWait(false);
      return;
    }

    viewBalance.catch(console.error);

    toast.promise(viewBalance, {
      error: 'Error on get balance',
      pending: 'Pending on get balance',
      success: { render: ({ data }) => `Balance: ${data}` },
    });

    setWait(false);
  };

  const deploy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWait(true);

    const wallet = await deployerEnv.getWallet();
    const salt = Fr.random();

    const tx = await TestTokenContract.deploy(wallet, 9999, wallet.getCompleteAddress().address).send({
      contractAddressSalt: salt,
    });

    const contract = await toast.promise(tx.deployed(), {
      pending: 'Deploying contract...',
      success: {
        render: ({ data }) => `Address: ${data.address}`,
      },
      error: 'Error deploying contract',
    });

    setContract(contract);
    setWait(false);
  };

  const setAddress = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, address: string) => {
    e.preventDefault();

    setWait(true);

    const connection = connectToContractByAddress(address);
    await toast.promise(connection, {
      pending: 'Pending...',
      error: 'Error connection contract',
      success: 'Success connection',
    });

    setWait(false);
  };

  const transfer = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    transferAddress: string,
    amount: number,
  ) => {
    e.preventDefault();

    setWait(true);

    const walletAddress = await deployerEnv.account.getCompleteAddress();

    const sendTransfer = await contract?.methods
      .transfer(amount, walletAddress, AztecAddress.fromString(transferAddress))
      .send();

    if (!sendTransfer) {
      setWait(false);
      return;
    }

    await toast.promise(sendTransfer?.wait(), {
      pending: 'Transfer pending...',
      error: {
        render: ({ data }) => {
          console.error(data);
          return 'Error transfer';
        },
      },
      success: {
        render: ({ data }) => `Transfer ${data.txHash.toString()} status: ${data.status}`,
      },
    });
    setWait(false);
  };

  const getTokenName = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setWait(true);

    // const getNameView = await contract?.methods.getName().view();

    // await toast.promise(getNameView, {
    //   error: 'Error on get token name',
    //   pending: 'Pending of get token name',
    //   success: { render: ({ data }) => `Token name: ${data}` },
    // });

    setWait(false);
  };

  const getTokenSymbol = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    setWait(true);

    // const getSymbolView = await contract?.methods.getSymbol().view();

    // await toast.promise(getSymbolView, {
    //   error: 'Error on get token symbol',
    //   pending: 'Pending of get token symbol',
    //   success: { render: ({ data }) => `Token symbol: ${data}` },
    // });

    setWait(false);
  };

  return { contract, wait, transfer, deploy, setAddress, mint, getTokenName, getTokenSymbol, getBalance };
}
