import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default async function SecurityCenterPage() {
  const events = await prisma.securityEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: { task: true },
    take: 50,
  });

  const overspendCount = events.filter(e => e.eventType === "OVERSPEND_BLOCKED").length;
  const duplicateCount = events.filter(e => e.eventType === "DUPLICATE_BLOCKED").length;
  const promptInjectionCount = events.filter(e => e.eventType === "PROMPT_INJECTION_BLOCKED").length;
  const totalBlocked = events.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-rose-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-500" /> Security Center
          </h2>
          <p className="text-slate-400 mt-2">
            Monitor intercepted threats, blocked unauthorized spending, and policy violations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-4xl font-bold text-rose-500">{totalBlocked}</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Total Blocked Attempts</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white">{overspendCount}</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Overspend Attempts</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white">{duplicateCount}</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Duplicate Payments</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-white">{promptInjectionCount}</CardTitle>
            <CardDescription className="text-slate-400 font-medium">Prompt Injections</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
        <CardHeader className="border-b border-white/5 bg-black/10">
          <CardTitle className="text-slate-100">Security Event Log</CardTitle>
          <CardDescription className="text-slate-400">Recent firewall and smart contract enforcements</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {events.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No security events recorded.</p>
            )}
            {events.map(event => (
              <div key={event.id} className="flex justify-between items-center p-4 border border-white/5 rounded-xl bg-black/30 hover:bg-black/40 transition-colors">
                <div className="flex items-center gap-4">
                  {event.severity === "CRITICAL" ? <ShieldAlert className="w-8 h-8 text-rose-500 p-1.5 bg-rose-500/10 rounded-lg border border-rose-500/20" /> : <ShieldCheck className="w-8 h-8 text-amber-500 p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20" />}
                  <div>
                    <h4 className={`font-semibold text-sm uppercase tracking-wider ${event.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>{event.eventType.replace(/_/g, " ")}</h4>
                    <p className="text-sm mt-1 text-slate-300">{event.description}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>{event.createdAt.toLocaleString()}</p>
                  {event.task && <p className="mt-1 font-mono text-slate-400">Task: {event.task.id.split("-")[1]}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
