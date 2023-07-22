"use client";
import {
  substrateWalletConnectedAtom,
  substrateAccountsAtom,
  substrateSelectedAccountAtom,
} from "@/atoms";
import ListBoxNetwork from "@/components/ListBoxNetwork";
import ListBoxToken from "@/components/ListBoxToken";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [substrateWalletConnected, setSubstrateWalletConnected] = useAtom(
    substrateWalletConnectedAtom
  );
  const [substrateAccounts, setSubstrateAccounts] = useAtom(
    substrateAccountsAtom
  );
  const [substrateSelectedAccount, setSubstrateSelectedAccount] = useAtom(
    substrateSelectedAccountAtom
  );
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  //   const allInjected = await web3Enable("beamswitch");
  const connectSubWallet = async () => {
    const allInjected = await web3Enable("beamswitch");
    console.log("all injected");
    console.log(allInjected);
    const allAccounts = await web3Accounts();
    if (allAccounts.length > 0) {
      setSubstrateWalletConnected(true);
      setSubstrateAccounts(allAccounts);
      setSubstrateSelectedAccount(allAccounts[0].address.toString());
      console.log(allAccounts[0].address.toString());
    } else {
      setSubstrateWalletConnected(false);
      setSubstrateAccounts([]);
      setSubstrateSelectedAccount("");
    }
  };

  const handleOnClick = async () => {};

  const { address, connector: isConnected } = useAccount();

  useEffect(() => setHasMounted(true), []);

  if (!hasMounted) {
    return null;
  }
  return (
    <main className="flex flex-1 bg-white text-black flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="flex w-full flex-col border rounded-lg p-6">
          <p className="text-xl font-bold">XCM CrossChain</p>
          <p>transfer assets between relay or parachains</p>
          <div className="flex flex-row space-x-2 mt-4">
            <div className="flex flex-col w-1/2">
              <ListBoxNetwork title="from network" />
            </div>
            <div className="flex flex-col w-1/2">
              <ListBoxNetwork title="to network" />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-row justify-center items-center py-2 px-4 border rounded-lg">
          <input
            type="number"
            className="w-full flex p-2 rounded-lg ring-0 focus:ring-0"
            placeholder="Enter amount"
          />
          <ListBoxToken title="token" />
        </div>
        <button
          className="flex w-full flex-row justify-center items-center py-2 px-4 border rounded-lg"
          onClick={() => {
            if (isConnected && address) {
              if (substrateWalletConnected && substrateSelectedAccount) {
                handleOnClick();
              } else {
                connectSubWallet();
              }
            } else {
              connect();
            }
          }}
        >
          {isConnected && address
            ? substrateWalletConnected && substrateSelectedAccount
              ? "beam it up"
              : "connect your polkadot wallet"
            : "Connect EVM wallet"}
        </button>
      </div>
    </main>
  );
}
