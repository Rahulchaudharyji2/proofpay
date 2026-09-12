"use client";

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function ConnectWallet() {
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
    // If wallet disconnects, and we are not on the landing page, redirect to home.
    if (mounted && !isConnected && pathname !== "/") {
      router.push("/");
    }
  }, [isConnected, pathname, router, mounted]);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed">
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
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
