"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "wagmi";

export default function CreateAgentPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "Research Assistant",
    purpose: "Research, summarize and process documents.",
    totalBudget: "50",
    dailyLimit: "10",
    perTransactionLimit: "3",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          purpose: formData.purpose,
          totalBudget: formData.totalBudget,
          dailyLimit: formData.dailyLimit,
          perTransactionLimit: formData.perTransactionLimit,
          allowedServices: ["translation", "ai-inference", "documents", "search", "summarization", "compute", "storage", "ocr"], // Defaulting for demo
          ownerAddress: address,
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push("/agents");
      } else {
        alert("Error creating agent: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create AI Agent</h2>
          <p className="text-slate-400 mt-2">
            Give your AI agents purchasing power — without giving them unlimited financial power.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="border-b border-white/5 bg-black/10">
            <CardTitle className="text-slate-100">Step 1 — Agent Identity</CardTitle>
            <CardDescription className="text-slate-400">Define who this agent is and what it does.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Agent Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Research Assistant" 
                className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Agent Purpose</Label>
              <Textarea 
                value={formData.purpose}
                onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                placeholder="What is this agent allowed to do?" 
                rows={3} 
                className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                required 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="border-b border-white/5 bg-black/10">
            <CardTitle className="text-slate-100">Step 2 — Financial Mandate</CardTitle>
            <CardDescription className="text-slate-400">These limits are enforced by the financial authorization layer (smart contract), not by asking the AI to behave.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-300">Total Budget ($)</Label>
                <Input 
                  type="number" 
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({...formData, totalBudget: e.target.value})}
                  className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 font-mono"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Daily Budget ($)</Label>
                <Input 
                  type="number" 
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({...formData, dailyLimit: e.target.value})}
                  className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 font-mono"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Max Per Transaction ($)</Label>
                <Input 
                  type="number" 
                  value={formData.perTransactionLimit}
                  onChange={(e) => setFormData({...formData, perTransactionLimit: e.target.value})}
                  className="bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 font-mono"
                  required 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {loading ? "Creating..." : "Create Mandate & Deploy Agent"}
          </Button>
        </div>
      </form>
    </div>
  );
}
