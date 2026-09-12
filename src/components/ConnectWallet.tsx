"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function ConnectWallet({ layout = "sidebar" }: { layout?: "sidebar" | "navbar" }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set cookie for server components
    if (isConnected && address) {
      document.cookie = `walletAddress=${address}; path=/`;
    } else {
      document.cookie = `walletAddress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }

    // If wallet disconnects, and we are not on the landing page, redirect to home.
    if (mounted && !isConnected && pathname !== "/") {
      router.push("/");
    }
  }, [isConnected, address, pathname, router, mounted]);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed">
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    if (layout === "navbar") {
      return (
        <div className="flex items-center gap-3">
          <div className="text-sm font-mono font-medium text-slate-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </div>
          <Button variant="outline" size="sm" onClick={() => disconnect()} className="rounded-full bg-transparent border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors h-9 px-4">
            Disconnect
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="text-xs font-mono bg-muted p-2 rounded truncate text-center">
          {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </div>
        <Button variant="outline" size="sm" onClick={() => disconnect()} className="w-full">
          Disconnect
        </Button>
      </div>
    );
  }

  if (layout === "navbar") {
    return (
      <Button 
        className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300 h-10 px-6 font-semibold border border-indigo-400/50"
        onClick={() => {
          const injected = connectors.find(c => c.id === 'injected');
          if (injected) connect({ connector: injected });
        }}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      className="w-full"
      onClick={() => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) connect({ connector: injected });
      }}
    >
      Connect Wallet
    </Button>
  );
}
