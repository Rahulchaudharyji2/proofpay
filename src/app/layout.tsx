import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProofPay - AI Agent Economic Security",
  description: "Economic Security Layer for Autonomous AI Commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground flex min-h-screen flex-col overflow-x-hidden`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
