"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

export default function AgentsPage() {
  const { address, isConnected } = useAccount();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = "/api/agents";
    if (isConnected && address) {
      url += `?ownerAddress=${address}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address, isConnected]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 mt-20">Loading your AI workforce...</div>;
  }

  if (!isConnected) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-6 text-center mt-20 bg-[#0f1015] rounded-3xl border border-white/5 shadow-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-white">Connect your Wallet</h2>
        <p className="text-slate-400 max-w-md mx-auto">Please connect your Web3 wallet to manage your AI agents and their economic mandates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-emerald-500/5 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">My AI Agents</h2>
          <p className="text-slate-400 mt-2">
            Deploy and manage autonomous agents bounded by your on-chain mandates.
          </p>
        </div>
        <Link href="/agents/create" className="relative z-10">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            Deploy New Agent
          </Button>
        </Link>
      </div>

      {agents.length === 0 ? (
        <Card className="bg-black/20 border-white/5 backdrop-blur-md">
          <CardContent className="text-center py-16 text-slate-400">
            No agents deployed yet. Create your first AI workforce member to begin.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="bg-black/20 border border-white/5 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 shadow-lg group">
              <CardHeader className="border-b border-white/5 bg-black/10">
                <CardTitle className="text-xl text-slate-100">{agent.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-slate-400">{agent.purpose}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs">{agent.status}</span>
                  </div>
                  {agent.mandates[0] && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Budget:</span>
                        <span className="font-medium text-slate-200">${agent.mandates[0].totalBudget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max/Tx:</span>
                        <span className="font-medium text-slate-200">${agent.mandates[0].perTransactionLimit}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tasks Executed:</span>
                    <span className="font-medium text-slate-200">{agent.tasks?.length || 0}</span>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex gap-3">
                    <Link href={`/agents/${agent.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-slate-300">View</Button>
                    </Link>
                    <Link href={`/tasks/create?agentId=${agent.id}`} className="flex-1">
                      <Button variant="default" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">Create Task</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
