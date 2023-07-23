"use client";
import { Sdk, TransferData } from "@moonbeam-network/xcm-sdk";
import {
  substrateWalletConnectedAtom,
  substrateAccountsAtom,
  substrateSelectedAccountAtom,
} from "@/atoms";
import {
  AnyParachain,
  Asset,
  AssetAmount,
  ChainAssetId,
  AnyChain,
  Ecosystem,
} from "@moonbeam-network/xcm-types";
import ListBoxNetwork from "@/components/ListBoxNetwork";
import ListBoxToken from "@/components/ListBoxToken";

import { useAtom } from "jotai";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useWalletClient,
  usePublicClient,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ethers } from "ethers";
import {
  cryptoWaitReady,
  decodeAddress,
  encodeAddress,
} from "@polkadot/util-crypto";
import { InjectedExtension } from "@polkadot/extension-inject/types";

const defaultAsset: Asset = {
  key: "glmr",
  originSymbol: "GLMR",
  isEqual: function (asset: Asset): boolean {
    throw new Error("Function not implemented.");
  },
};

function toSubstrateAddress(address: string) {
  const substrateStashId = encodeAddress(decodeAddress(address), 42);
  return substrateStashId;
}

async function getTransferData(
  selectedAssetKey: string,
  sourceChain: AnyChain,
  destChain: AnyChain,
  sourceAddr: string,
  destAddr: string,
  ethersSigner: any,
  substrateSigner: any
) {
  console.log(sourceChain.name);
  console.log(destChain.name);
  // console.log(sourceChain.isEvmParachain());
  // console.log(sourceChain.isParachain());
  if (sourceChain?.isParachain()) {
    if (destChain?.isEvmParachain()) {
      console.log("from sub to evm");

      const data = await Sdk().getTransferData({
        destinationAddress: destAddr,
        destinationKeyOrChain: destChain.key,
        keyOrAsset: selectedAssetKey,
        polkadotSigner: substrateSigner,
        ethersSigner: ethersSigner,
        sourceAddress: sourceAddr,
        sourceKeyOrChain: sourceChain.key,
      });
      // setTransferData(data);
      console.log("data min");
      console.log("data min", data.min.toDecimal());
      return data;
    } else {
      console.log("from sub to sub");

      const data = await Sdk().getTransferData({
        destinationAddress: destAddr,
        destinationKeyOrChain: destChain.key,
        keyOrAsset: selectedAssetKey,
        polkadotSigner: substrateSigner,
        ethersSigner: ethersSigner,
        sourceAddress: sourceAddr,
        sourceKeyOrChain: sourceChain.key,
      });
      // setTransferData(data);
      console.log("data min");
      console.log("data min", data.min.toDecimal());
      return data;
    }
  } else {
    if (destChain?.isEvmParachain()) {
      console.log("from evm to evm");
      const data = await Sdk().getTransferData({
        destinationAddress: destAddr,
        destinationKeyOrChain: destChain.key,
        keyOrAsset: selectedAssetKey,
        // polkadotSigner: substrateSigner,
        ethersSigner: ethersSigner,
        sourceAddress: sourceAddr,
        sourceKeyOrChain: sourceChain.key,
      });
      // setTransferData(data);
      console.log("data min");
      console.log("data min", data.min.toDecimal());
      return data;
    } else {
      console.log("from evm to sub");
      const data = await Sdk().getTransferData({
        destinationAddress: destAddr,
        destinationKeyOrChain: destChain.key,
        keyOrAsset: selectedAssetKey,
        // polkadotSigner: substrateSigner,
        ethersSigner: ethersSigner,
        sourceAddress: sourceAddr,
        // address as `0x${string}`
        sourceKeyOrChain: sourceChain.key,
      });
      console.log("data min");
      console.log("data min", data.min.toDecimal());
      return data;
    }
  }
}

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
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletSigner } = useWalletClient();
  console.log(walletSigner);
  const [substrateAccount, setSubstrateAccount] = useState<string>();
  const [substrateInjector, setSubstrateInjector] =
    useState<InjectedExtension>();
  const [ethersSigner, setEthersSigner] = useState();
  const [assets, setAssets] = useState<Asset[]>([defaultAsset]);
  const [assetAmount, setAssetAmount] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<Asset>(defaultAsset);
  const [sourceChains, setSourceChains] = useState<AnyChain[]>([]);
  const [selectedSourceChain, setSelectedSourceChain] = useState<AnyChain>(
    () => Sdk().assets().asset(selectedAsset.key).sourceChains[0]
  );
  const [destinationChains, setDestinationChains] = useState<AnyChain[]>(
    () =>
      Sdk().assets().asset(selectedAsset.key).source(selectedSourceChain.key)
        .destinationChains
  );
  const [selectedDestinationChain, setSelectedDestinationChain] =
    useState<AnyChain>(destinationChains[0]);

  const [destAddress, setDestAddress] = useState<string>("");
  const [transferData, setTransferData] = useState<TransferData>();

  const [isTransferPossible, setIsTransferPossible] = useState<boolean>(false);

  //   const allInjected = await web3Enable("beamswitch");
  const connectSubWallet = async () => {
    import("@polkadot/extension-dapp").then(async (ed) => {
      await cryptoWaitReady();
      const allInjected = await ed.web3Enable("beamswitch");
      // console.log("all injected");
      // console.log(allInjected);
      const allAccounts = await ed.web3Accounts();
      if (allAccounts.length > 0) {
        setSubstrateWalletConnected(true);
        setSubstrateAccounts(allAccounts);
        setSubstrateSelectedAccount(allAccounts[0]);
        // console.log(allAccounts[0].address.toString());
      } else {
        setSubstrateWalletConnected(false);
        setSubstrateAccounts([]);
        setSubstrateSelectedAccount(null);
      }
    });
  };

  const handleOnClick = async () => {};

  const { address, connector: isConnected } = useAccount();
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    function getAssets() {
      const assetsList = Sdk().assets().assets;
      setAssets(assetsList);
    }
    getAssets();
  }, []);

  useEffect(() => {
    if (substrateSelectedAccount) {
      const subAddr = toSubstrateAddress(substrateSelectedAccount.address);
      setSubstrateAccount(subAddr);
    }
  }, [substrateSelectedAccount]);

  useEffect(() => {
    async function ethSigner() {
      const provider = new ethers.BrowserProvider(window?.ethereum);
      const signer = await provider.getSigner();
      setEthersSigner(signer as any);
    }

    if (window?.ethereum !== null) {
      ethSigner();
    }
  }, [address]);

  useEffect(() => {
    async function subSigner() {
      if (!substrateSelectedAccount?.address) {
        throw new Error("No account selected");
      }
      await cryptoWaitReady();
      import("@polkadot/extension-dapp").then(async (ed) => {
        const injector = await ed.web3FromSource(
          substrateSelectedAccount.meta.source
        );
        setSubstrateInjector(injector);
      });
    }
    if (substrateSelectedAccount) {
      subSigner();
    }
  }, [substrateSelectedAccount]);

  useEffect(() => {
    function getSourceChains() {
      const { sourceChains } = Sdk().assets().asset(selectedAsset.key);
      // console.log(
      //   `The supported source chains are: ${sourceChains.map(
      //     (chain) => chain.name
      //   )}`
      // );
      setSourceChains(sourceChains);
      setSelectedSourceChain(sourceChains[0]);
    }
    // console.log("selected asset changed");
    getSourceChains();
  }, [selectedAsset]);

  useEffect(() => {
    function getDestinationChains() {
      const { destinationChains, destination } = Sdk()
        .assets()
        .asset(selectedAsset.key)
        .source(selectedSourceChain.key);
      // console.log(
      //   `The supported destination chains are: ${destinationChains.map(
      //     (chain) => chain.name
      //   )}`
      // );
      setDestinationChains(destinationChains);
      setSelectedDestinationChain(destinationChains[0]);
    }
    // console.log("selected asset destination changed");
    getDestinationChains();
  }, [selectedAsset, selectedSourceChain]);

  useEffect(() => {
    async function getData() {
      if (
        !selectedAsset ||
        !selectedSourceChain ||
        !selectedDestinationChain ||
        !substrateAccount ||
        !destAddress ||
        !ethersSigner ||
        !substrateInjector
      ) {
        setTransferData(undefined);
        return;
      }
      const data = await getTransferData(
        selectedAsset.key,
        selectedSourceChain,
        selectedDestinationChain,
        substrateAccount,
        destAddress,
        ethersSigner,
        substrateInjector
      );
      setTransferData(data);
    }
    if (
      substrateSelectedAccount &&
      ethersSigner &&
      substrateInjector &&
      destAddress &&
      selectedAsset &&
      selectedSourceChain &&
      address
    ) {
      getData();
    }
  }, [
    selectedAsset,
    selectedSourceChain,
    selectedDestinationChain,
    substrateSelectedAccount,
    destAddress,
    substrateInjector,
    ethersSigner,
    address,
    substrateAccount,
  ]);

  // useEffect(() => {
  //   async function getTransferData() {
  //     const data = await Sdk().getTransferData({
  //       destinationAddress: destAddress,
  //       destinationKeyOrChain: selectedDestinationChain.key,
  //       keyOrAsset: selectedAsset.key,
  //       // polkadotSigner: ,
  //       sourceAddress: destAddress,
  //       sourceKeyOrChain: 'polkadot',
  //     });
  //   }
  // }, [transferData]);

  useEffect(() => {
    if (transferData) {
      const possible = transferData.isSwapPossible;
      setIsTransferPossible(possible);
    } else {
      setIsTransferPossible(false);
    }
  }, [transferData]);

  if (!hasMounted) {
    return null;
  }

  const signAndSend = async () => {
    if (!transferData || assetAmount === "") {
      throw new Error("No transfer data");
    }
    const txHash = await transferData.transfer(assetAmount);
    console.log(txHash);
  };

  // console.log("chain.id");
  // console.log(chain?.id);
  // console.log("selectedSourceChain.id");
  // console.log(selectedSourceChain?.id);
  // console.log();

  console.log("isTransferPossible");
  console.log(isTransferPossible);

  return (
    <main className="flex flex-1 bg-white text-black flex-col items-center justify-between p-24">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex w-full flex-col border rounded-lg p-4 space-y-2">
          <p className="text-xl font-bold">XCM CrossChain</p>
          <p>transfer assets between relay or parachains</p>
          <div className="w-1/2">
            <ListBoxToken
              title="token"
              assetsList={assets}
              selected={selectedAsset}
              setSelected={setSelectedAsset}
            />
          </div>
        </div>
        <div className="flex w-full flex-row justify-center items-center border rounded-lg p-4">
          <div className="flex flex-row w-full space-x-2">
            <div className="flex flex-col w-1/2 space-y-2">
              <ListBoxNetwork
                title="from network"
                chains={sourceChains}
                selectedChain={selectedSourceChain}
                setSelectedChain={setSelectedSourceChain}
              />
              {selectedSourceChain.isEvmParachain() ? (
                selectedSourceChain?.id !== chain?.id ? (
                  <button
                    className="border rounded-lg py-2"
                    onClick={() => {
                      !isConnected
                        ? connect()
                        : switchNetwork?.(selectedSourceChain?.id);
                    }}
                  >
                    {!isConnected
                      ? "Connect wallet"
                      : selectedSourceChain?.id !== chain?.id &&
                        "Switch network"}
                  </button>
                ) : (
                  <></>
                )
              ) : !substrateSelectedAccount ? (
                <button
                  className="border rounded-lg py-2"
                  onClick={() => connectSubWallet()}
                >
                  Connect Wallet
                </button>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-col w-1/2 space-y-2">
              <ListBoxNetwork
                title="to network"
                chains={destinationChains}
                selectedChain={selectedDestinationChain}
                setSelectedChain={setSelectedDestinationChain}
              />
              {selectedDestinationChain?.isEvmParachain() ? (
                selectedDestinationChain?.id !== chain?.id ? (
                  <button
                    className="border rounded-lg py-2"
                    onClick={() => {
                      !isConnected
                        ? connect()
                        : switchNetwork?.(selectedDestinationChain?.id);
                    }}
                  >
                    {!isConnected
                      ? "Connect wallet"
                      : selectedDestinationChain?.id !== chain?.id &&
                        "Switch network"}
                  </button>
                ) : (
                  <></>
                )
              ) : !substrateSelectedAccount ? (
                <button
                  className="border rounded-lg py-2"
                  onClick={() => connectSubWallet()}
                >
                  Connect Wallet
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <div className="flex w-full rounded-md border px-4 py-2">
          <input
            type="number"
            className="w-full flex p-2 rounded-lg ring-0 focus:ring-0"
            placeholder="Enter amount"
            value={parseFloat(assetAmount) === 0 ? "" : assetAmount}
            min={0}
            onChange={(e) => {
              if (parseFloat(e.target.value).toString() === "NaN") {
                setAssetAmount("");
              } else {
                setAssetAmount(e.target.value.toString());
              }
            }}
          />
        </div>
        <div className="flex w-full flex-row justify-center items-center py-2 px-4 border rounded-lg">
          <input
            type="string"
            className="w-full flex p-2 rounded-lg ring-0 focus:ring-0"
            placeholder="Destination address"
            onChange={(e) => {
              setDestAddress(e.target.value.toString());
            }}
          />
        </div>
        <button
          className="flex w-full flex-row justify-center items-center py-2 px-4 border rounded-lg"
          onClick={() => {
            if (isConnected && address) {
              if (substrateWalletConnected && substrateSelectedAccount) {
                signAndSend();
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
