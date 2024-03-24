import { useTestTokenContract } from '../hooks/useTestTokenContract';
import deployerEnv from '../config';
import { useState } from 'react';
import React from 'react';

export function Home() {
  const { contract, wait, ...testTokenContractActions } = useTestTokenContract();

  const [customAddress, setCustomAddress] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('');

  React.useEffect(() => {
    deployerEnv.getWallet().then(wallet => {
      setCurrentAddress(wallet.getAddress().toString());
    });
  }, []);

  if (!contract) {
    return (
      <div>
        <div>
          <input
            type="text"
            placeholder="Custom address"
            onChange={event => {
              setCustomAddress(event.currentTarget.value);
            }}
          />
          <button
            onClick={event => {
              testTokenContractActions.setAddress(event, customAddress);
            }}
          >
            Set contract address
          </button>
        </div>
        <form onSubmit={testTokenContractActions.deploy}>
          <button type="submit" disabled={wait}>
            Deploy test token contract
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p>Wallet address: {currentAddress}</p>
      </div>
      <div>
        <input
          placeholder="transfer address"
          onChange={event => {
            setTransferAddress(event.currentTarget.value);
          }}
          disabled={wait}
        ></input>
        <input
          placeholder="transfer amount"
          type="number"
          onChange={event => {
            setTransferAmount(parseFloat(event.currentTarget.value));
          }}
          disabled={wait}
        ></input>
        <button
          onClick={e => {
            testTokenContractActions.transfer(e, transferAddress, transferAmount);
          }}
          disabled={wait}
        >
          Transfer
        </button>

        <button onClick={testTokenContractActions.getTokenName} disabled={wait}>
          Get token name
        </button>

        <button onClick={testTokenContractActions.getTokenSymbol} disabled={wait}>
          Get token symbol
        </button>
      </div>
      <button onClick={testTokenContractActions.getBalance} disabled={wait}>
        Get balance
      </button>
      <button onClick={testTokenContractActions.mint} disabled={wait}>
        Mint
      </button>
    </div>
  );
}
