import type {
  InjectedAccountWithMeta,
  InjectedExtension,
} from "@polkadot/extension-inject/types";
import { atom } from "jotai";

export const substrateWalletConnectedAtom = atom<boolean>(false);

export const substrateAccountsAtom = atom<InjectedAccountWithMeta[] | null>([]);

export const substrateSelectedAccountAtom = atom<string | "">("");
