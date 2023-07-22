"use client";
import ListBoxNetwork from "@/components/ListBoxNetwork";
import ListBoxToken from "@/components/ListBoxToken";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);

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
        <button className="flex w-full flex-row justify-center items-center py-2 px-4 border rounded-lg">
          connect wallet
        </button>
      </div>
    </main>
  );
}
