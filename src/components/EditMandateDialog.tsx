"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const paymentEscrowABI = [
  {
    "inputs": [{"internalType": "address","name": "_agent","type": "address"}],
    "name": "fundAgent",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "_agent","type": "address"},
      {"internalType": "uint256","name": "_amount","type": "uint256"}
    ],
    "name": "withdrawFromAgentVault",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function EditMandateDialog({ agentId, agentAddress, currentMandate }: { agentId: string, agentAddress: string, currentMandate: any }) {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  
  const [formData, setFormData] = useState({
    totalBudget: currentMandate?.totalBudget?.toString() || "0",
    dailyLimit: currentMandate?.dailyLimit?.toString() || "0",
    perTransactionLimit: currentMandate?.perTransactionLimit?.toString() || "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    setTxHash("");
    
    try {
      const oldBudget = parseFloat(currentMandate?.totalBudget || "0");
      const newBudget = parseFloat(formData.totalBudget);
      const delta = newBudget - oldBudget;
      
      let hash = "";
      const escrowAddress = process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS as `0x${string}`;

      if (delta > 0) {
        hash = await writeContractAsync({
           address: escrowAddress,
           abi: paymentEscrowABI,
           functionName: 'fundAgent',
           args: [agentAddress as `0x${string}`],
           value: parseEther(delta.toString())
        });
      } else if (delta < 0) {
        hash = await writeContractAsync({
           address: escrowAddress,
           abi: paymentEscrowABI,
           functionName: 'withdrawFromAgentVault',
           args: [agentAddress as `0x${string}`, parseEther(Math.abs(delta).toString())],
        });
      }
      
      if (hash) {
        setTxHash(hash);
      }
      
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ownerAddress: address,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        alert("Error updating mandate: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update mandate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400" />}>
        Edit Mandate
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0f1015] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Update Financial Mandate</DialogTitle>
          <DialogDescription className="text-slate-400">
            Changes are written directly to the AgentMandate smart contract.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Total Budget ($)</Label>
            <Input 
              type="number" 
              value={formData.totalBudget}
              onChange={(e) => setFormData({...formData, totalBudget: e.target.value})}
              className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 font-mono"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Daily Limit ($)</Label>
            <Input 
              type="number" 
              value={formData.dailyLimit}
              onChange={(e) => setFormData({...formData, dailyLimit: e.target.value})}
              className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 font-mono"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Max Per Transaction ($)</Label>
            <Input 
              type="number" 
              value={formData.perTransactionLimit}
              onChange={(e) => setFormData({...formData, perTransactionLimit: e.target.value})}
              className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 font-mono"
              required 
            />
          </div>
          <DialogFooter className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {txHash && (
              <div className="text-xs text-emerald-400 font-mono truncate max-w-[200px]">
                Tx: {txHash}
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-slate-300 hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                {loading ? "Processing..." : "Save & Escrow"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
