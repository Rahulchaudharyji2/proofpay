import Link from "next/link";
import { LayoutDashboard, Users, Server, CheckSquare, CreditCard, ShieldAlert, FileText, Play, Activity, Layers } from "lucide-react";
import { ConnectWallet } from "./ConnectWallet";

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0f] border-r border-white/5 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-white">
          <ShieldAlert className="text-indigo-500 w-6 h-6" />
          ProofPay
        </h1>
        <p className="text-xs text-indigo-400/80 mt-1 font-medium">Economic Security Layer</p>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
          <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
        </Link>
        <Link href="/agents" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Users className="w-4 h-4" /> Agents
        </Link>
        <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Activity className="w-4 h-4" /> Analytics
        </Link>
        <Link href="/services" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Layers className="w-4 h-4" /> Services
        </Link>
        <Link href="/providers" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <Server className="w-4 h-4" /> Providers
        </Link>
        <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <CheckSquare className="w-4 h-4" /> Tasks
        </Link>
        <Link href="/payments" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <CreditCard className="w-4 h-4" /> Payments
        </Link>
        <Link href="/security" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <ShieldAlert className="w-4 h-4" /> Security Center
        </Link>
        <Link href="/audit" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <FileText className="w-4 h-4" /> Audit Trail
        </Link>
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        <ConnectWallet />
        <Link href="/demo" className="flex items-center justify-center gap-2 w-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 py-2.5 rounded-lg font-semibold hover:bg-indigo-500/20 transition-colors shadow-sm text-sm">
          <Play className="w-4 h-4" /> Run Threat Demo
        </Link>
      </div>
    </aside>
  );
}
