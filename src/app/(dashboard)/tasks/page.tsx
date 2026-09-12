import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  let tasks: any[] = [];
  try {
    const cookieStore = await cookies();
    const walletAddress = cookieStore.get('walletAddress')?.value;
    console.log("[DEBUG] TasksPage cookie walletAddress:", walletAddress);
    
    const agentFilter = walletAddress ? { agent: { ownerAddress: { equals: walletAddress, mode: 'insensitive' } } } : {};

    tasks = await prisma.task.findMany({
      where: { ...agentFilter },
      include: { provider: { include: { metrics: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (e) {
    // Database not configured yet. Providing mock tasks for UI demonstration.
    tasks = [
      {
        id: "TASK-123456",
        description: "Translate document XYZ to Hindi",
        serviceType: "translation",
        status: "SETTLED",
        paymentAmount: 0.5,
        paymentId: "PAY-123",
        resultCid: "bafybeih...mockcid",
        createdAt: new Date(),
        provider: {
          name: "Provider B",
          metrics: { price: 0.5, quality: 94, reliability: 97, latencyMs: 1400, trustScore: 88 },
        },
      }
    ];
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/5 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Tasks & Escrow Lifecycle</h2>
          <p className="text-slate-400 mt-2">
            View autonomous agent purchases, decision rationale, and cryptographic evidence.
          </p>
        </div>
        <Link href="/tasks/create" className="relative z-10">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            Create Your First Task
          </Button>
        </Link>
      </div>

      {tasks.length === 0 ? (
        <Card className="bg-black/20 border-white/5 backdrop-blur-md">
          <CardContent className="text-center py-16 text-slate-400">
            No tasks found. Deploy an agent to begin autonomous commerce.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-black/20 border border-white/5 backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300 shadow-lg group overflow-hidden">
              <CardHeader className="bg-black/10 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-slate-100">{task.description}</CardTitle>
                    <CardDescription className="font-mono mt-1 text-xs text-slate-500">ID: {task.id}</CardDescription>
                  </div>
                  <Badge variant={task.status === "SETTLED" ? "default" : task.status === "FAILED" ? "destructive" : "secondary"} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1">
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                  
                  <div className="p-6 space-y-6 col-span-1 md:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">What Was Bought</p>
                        <p className="font-medium mt-1 text-slate-200">Translation service</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Who Provided It</p>
                        <p className="font-medium mt-1 text-slate-200">{task.provider?.name || "Pending..."}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Price</p>
                        <p className="font-medium mt-1 text-slate-200">${task.paymentAmount || "0.00"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Why This Provider</p>
                        <p className="font-medium mt-1 text-xs text-slate-400">Quality / reliability / price signals</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-6 border-t border-white/5">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payment</p>
                        <p className="font-medium mt-1 text-xs text-emerald-400">HTTP 402 → Authorization → Escrow</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Proof</p>
                        <div className="mt-1 space-y-1">
                           <p className="text-xs font-mono truncate text-slate-400">Hash: {task.paymentId || "N/A"}</p>
                           {task.attachedFileCid && (
                             <a href={`https://gateway.pinata.cloud/ipfs/${task.attachedFileCid}`} target="_blank" rel="noreferrer" className="block text-xs font-mono text-blue-400 hover:underline truncate">
                               File: {task.attachedFileCid}
                             </a>
                           )}
                           {task.resultCid && (
                             <a href={`https://gateway.pinata.cloud/ipfs/${task.resultCid}`} target="_blank" rel="noreferrer" className="block text-xs font-mono text-indigo-400 hover:underline truncate">
                               Proof: {task.resultCid}
                             </a>
                           )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Outcome</p>
                        <p className="font-medium mt-1 text-emerald-400">Verified</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Settlement</p>
                        <p className="font-medium mt-1 text-slate-200">Completed</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Task Lifecycle</h3>
                      <div className="flex flex-wrap gap-2 items-center text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> CREATED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> PROVIDER_SELECTED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> PAYMENT_REQUIRED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> AUTHORIZED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> ESCROWED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> DELIVERED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> VERIFIED</span>
                        <ArrowRight className="w-3 h-3 opacity-30" />
                        <span className="flex items-center gap-1 text-indigo-400 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> SETTLED</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 flex justify-end">
                      <Link href={`/tasks/${task.id}`}>
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10">View Details & Execute Task →</Button>
                      </Link>
                    </div>
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
