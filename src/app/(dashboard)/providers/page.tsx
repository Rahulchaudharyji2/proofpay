import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";
import { Server, Star, Clock, AlertTriangle } from "lucide-react";

export default async function ProvidersPage() {
  const providers = await prisma.provider.findMany({
    include: { metrics: true },
    orderBy: { metrics: { trustScore: "desc" } }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-emerald-500" />
            Provider Marketplace
          </h2>
          <p className="text-slate-400 mt-2">View authorized service providers and their performance metrics.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id} className="bg-black/20 border-white/5 backdrop-blur-md hover:border-emerald-500/30 transition-all shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/5 bg-black/10">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-100">
                <Server className="w-5 h-5 text-emerald-400" />
                {provider.name}
              </CardTitle>
              <Badge variant={provider.status === "ACTIVE" ? "default" : "secondary"} className={provider.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"}>
                {provider.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-400 mb-6">{provider.description}</p>
              
              {provider.metrics && (
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div className="text-slate-500 font-medium">Price</div>
                    <div className="font-semibold text-slate-200 text-right">${provider.metrics.price.toFixed(2)}</div>
                    
                    <div className="text-slate-500 flex items-center gap-1.5 font-medium"><Star className="w-3.5 h-3.5 text-yellow-500"/> Quality</div>
                    <div className="font-semibold text-slate-200 text-right">{provider.metrics.quality}/100</div>
                    
                    <div className="text-slate-500 flex items-center gap-1.5 font-medium"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500"/> Reliability</div>
                    <div className="font-semibold text-slate-200 text-right">{provider.metrics.reliability}%</div>

                    <div className="text-slate-500 flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 text-rose-500"/> Latency</div>
                    <div className="font-semibold text-slate-200 text-right">{provider.metrics.latencyMs} ms</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Needed to avoid errors if icon is missing from import
import { CheckCircle2 } from "lucide-react";
