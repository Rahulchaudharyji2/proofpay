import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";

export default async function PaymentsPage() {
  const tasks = await prisma.task.findMany({
    where: { paymentId: { not: null } },
    include: { provider: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Payments & Escrow</h2>
          <p className="text-slate-400 mt-2">View authorized HTTP 402 payments and their on-chain settlement status.</p>
        </div>
      </div>

      <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
        <CardHeader className="border-b border-white/5 bg-black/10">
          <CardTitle className="text-slate-100">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/40 text-slate-400 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left font-medium uppercase tracking-wider text-xs">Payment ID</th>
                  <th className="px-6 py-4 text-left font-medium uppercase tracking-wider text-xs">Task</th>
                  <th className="px-6 py-4 text-left font-medium uppercase tracking-wider text-xs">Provider</th>
                  <th className="px-6 py-4 text-right font-medium uppercase tracking-wider text-xs">Amount</th>
                  <th className="px-6 py-4 text-center font-medium uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 text-right font-medium uppercase tracking-wider text-xs">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No payments found.</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-300">{task.paymentId}</td>
                      <td className="px-6 py-4 text-slate-200">{task.id}</td>
                      <td className="px-6 py-4 text-slate-200">{task.provider?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-400">${task.paymentAmount?.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={task.status === "SETTLED" ? "default" : task.status === "FAILED" ? "destructive" : "secondary"} className={task.status === "SETTLED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-500">
                        {new Date(task.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
