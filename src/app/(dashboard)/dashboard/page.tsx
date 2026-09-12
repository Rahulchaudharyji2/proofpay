import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, CheckCircle, Database, Sparkles, Server, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let stats = {
    budget: 0,
    spent: 0,
    remaining: 0,
    perTxLimit: 0,
    tasksCompleted: 0,
    securityEvents: 0,
    providers: 0,
  };

  try {
    const cookieStore = await cookies();
    const walletAddress = cookieStore.get('walletAddress')?.value;
    
    // If no wallet connected, we could show 0 or keep it global. Let's filter strictly:
    const agentFilter: any = walletAddress ? { agent: { ownerAddress: { equals: walletAddress, mode: 'insensitive' } } } : {};

    const mandates = await prisma.mandate.findMany({ where: { status: "ACTIVE", ...agentFilter } });
    const settledTasks = await prisma.task.findMany({ where: { status: "SETTLED", ...agentFilter } });
    const events = await prisma.securityEvent.count({
      where: walletAddress ? { task: { agent: { ownerAddress: { equals: walletAddress, mode: 'insensitive' } } } } : {}
    });
    const providers = await prisma.provider.count({ where: { status: "ACTIVE" } });

    const totalSpent = settledTasks.reduce((acc, t) => acc + (t.paymentAmount || 0), 0);

    if (mandates.length > 0) {
      stats.budget = mandates.reduce((acc, m) => acc + m.totalBudget, 0);
      stats.spent = totalSpent;
      stats.remaining = stats.budget - stats.spent;
      stats.perTxLimit = mandates[0].perTransactionLimit;
    } else {
      stats.spent = totalSpent;
    }
    stats.tasksCompleted = settledTasks.length;
    stats.securityEvents = events;
    stats.providers = providers;
  } catch (error) {
    console.error("Database connection error:", error);
  }

  return (
    <div className="space-y-10 pb-12 px-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-emerald-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 mb-6 border-indigo-500/20 px-3 py-1 text-xs">
            Admin Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5">
            ProofPay <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Command Center</span>
          </h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl">
            Monitor your autonomous AI agents, track on-chain escrows, and view security events in real-time. Your agents are currently live and bounded by cryptographic limits.
          </p>
          <div className="flex gap-4">
            <Link href="/agents/create" className="group bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              Deploy AI Agent <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Global Authorized Budget" 
          value={`$${stats.budget.toFixed(2)}`} 
          subtext="Across all active agents" 
          icon={<Database className="w-5 h-5 text-indigo-400" />} 
          colorClass="border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40"
        />
        <StatCard 
          title="Value Settled" 
          value={`$${stats.spent.toFixed(2)}`} 
          subtext={`Remaining: $${stats.remaining.toFixed(2)}`} 
          icon={<Activity className="w-5 h-5 text-emerald-400" />} 
          colorClass="border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40"
        />
        <StatCard 
          title="Autonomous Purchases" 
          value={stats.tasksCompleted.toString()} 
          subtext={`Active Providers: ${stats.providers}`} 
          icon={<CheckCircle className="w-5 h-5 text-blue-400" />} 
          colorClass="border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40"
        />
        <StatCard 
          title="Attacks Prevented" 
          value={stats.securityEvents.toString()} 
          subtext="Firewall & Smart Contract Blocks" 
          icon={<ShieldAlert className="w-5 h-5 text-rose-400" />} 
          colorClass="border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40"
        />
      </div>

      {/* Architecture Distinction */}
      <div className="mt-16 space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100">System Architecture</h2>
          <p className="text-slate-400 mt-2">The active components currently powering your autonomous economy.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FeatureCard 
            title="W3A-1 Required Core" 
            desc="Canonical Hackathon Architecture"
            icon={<ShieldCheck className="w-6 h-6 text-indigo-400" />}
            colorClass="bg-[#0f1015] border-white/10 hover:border-indigo-500/30"
            items={[
              "AgentMandate.sol limits",
              "PaymentEscrow.sol bounds",
              "HTTP 402 Flow",
              "Outcome Verification & Settlement",
              "Live Overspend Blocking"
            ]}
          />
          <FeatureCard 
            title="ProofPay Extensions" 
            desc="Real AI Integration & UI"
            icon={<Sparkles className="w-6 h-6 text-emerald-400" />}
            colorClass="bg-[#0f1015] border-white/10 hover:border-emerald-500/30"
            items={[
              "Real Gemini LLM Task Parsing",
              "Real Gemini LLM Provider Decision",
              "Comprehensive Audit Trail",
              "Deep Application Firewall",
              "Dynamic UI Dashboards"
            ]}
          />
          <FeatureCard 
            title="Simulated Components" 
            desc="Mocked for Demo Purposes"
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            colorClass="bg-[#0f1015] border-white/10 hover:border-amber-500/30"
            items={[
              "Real-world Provider Fulfillment",
              "Complex Outcome Verifier logic"
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtext, icon, colorClass }: { title: string, value: string, subtext: string, icon: React.ReactNode, colorClass: string }) {
  return (
    <Card className={`border ${colorClass} transition-all duration-300 shadow-lg backdrop-blur-md`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-black/20">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className="bg-black/50 p-2 rounded-lg border border-white/5">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-3xl font-bold text-white">{value}</div>
        <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>
      </CardContent>
    </Card>
  );
}

function FeatureCard({ title, desc, icon, items, colorClass }: { title: string, desc: string, icon: React.ReactNode, items: string[], colorClass: string }) {
  return (
    <Card className={`border ${colorClass} transition-all duration-300 shadow-xl overflow-hidden group`}>
      <CardHeader className="bg-black/40 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-12 h-12 rounded-xl bg-black/60 flex items-center justify-center mb-4 border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <CardTitle className="text-lg text-slate-100">{title}</CardTitle>
        <CardDescription className="text-slate-400">{desc}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 bg-black/20">
        <ul className="space-y-3 text-sm text-slate-300">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-500/70 mt-0.5 shrink-0" /> 
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
