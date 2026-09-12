import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Sparkles, ArrowRight, Layers } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    include: {
      providers: {
        include: {
          provider: true
        }
      }
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-indigo-500" /> Service Catalog
          </h2>
          <p className="text-slate-400 mt-2">
            Browse available digital services your AI agents can autonomously purchase.
          </p>
        </div>
        <Link href="/dashboard" className="relative z-10 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors">
          Back to Dashboard
        </Link>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-black/20 rounded-2xl border border-white/5 shadow-lg overflow-hidden hover:border-indigo-500/30 transition-all duration-300 flex flex-col group backdrop-blur-md">
              <div className="p-6 flex-grow">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {service.category}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${service.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  {service.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {service.description}
                </p>
                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-500">Base Price</span>
                    <span className="font-semibold text-slate-200">${service.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Unit</span>
                    <span className="font-medium text-slate-300">{service.unit}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-indigo-400">{service.providers.length}</span> active providers
                </div>
                <Link href="/agents/create" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/link">
                  Use Service
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
          {services.length === 0 && (
             <div className="col-span-full text-center py-16 text-slate-500 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-md">
               No services found. Ensure you have seeded the database.
             </div>
          )}
        </div>
    </div>
  );
}
