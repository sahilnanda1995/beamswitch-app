import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import NavBar from "@/components/Navbar";
import { WagmiSetup } from "@/components/WagmiSetup";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BeamSwitch",
  description: "Moonbeam-Powered Interoperability for the Polkadot Universe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative flex flex-col min-h-screen">
        <WagmiSetup>
          <NavBar />
          {children}
        </WagmiSetup>
      </body>
    </html>
  );
}
