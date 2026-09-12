import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { FileText, ArrowDown } from "lucide-react";

export default async function AuditPage() {
  const events = await prisma.auditEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-500" /> Audit Timeline
          </h2>
          <p className="text-slate-400 mt-2">Chronological immutable record of all agent decisions and financial events.</p>
        </div>
      </div>

      <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
        <CardHeader className="border-b border-white/5 bg-black/10">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <FileText className="w-5 h-5 text-indigo-400" /> Full System Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No audit events found.</div>
          ) : (
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={event.id} className="relative pl-6 group">
                  {/* Timeline connecting line */}
                  {i !== events.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-white/10 group-hover:bg-indigo-500/30 transition-colors"></div>
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-1.5 top-2.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-[#0f1015]"></div>
                  
                  <div className="bg-black/30 p-4 rounded-xl border border-white/5 hover:bg-black/40 hover:border-indigo-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-slate-200">{event.eventType}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{event.description}</p>
                    {event.taskId && (
                      <p className="text-xs font-mono text-indigo-400 mt-2">Task Ref: {event.taskId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
