"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Activity, DollarSign, Target, Zap } from "lucide-react";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export default function AnalyticsClient({ data }: { data: any }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Platform Analytics</h2>
          <p className="text-slate-400 mt-2">Aggregate metrics for AI agent activity and economic throughput.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 border-white/5 backdrop-blur-md hover:border-indigo-500/30 transition-colors shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-black/10">
            <CardTitle className="text-sm font-medium text-slate-300">Total Tasks Executed</CardTitle>
            <div className="bg-black/50 p-2 rounded-lg border border-white/5">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">{data.metrics.totalTasks}</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Real-time network activity</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/5 backdrop-blur-md hover:border-emerald-500/30 transition-colors shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-black/10">
            <CardTitle className="text-sm font-medium text-slate-300">Total Value Processed</CardTitle>
            <div className="bg-black/50 p-2 rounded-lg border border-white/5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">${data.metrics.totalSpend.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Sum of requested payments</p>
          </CardContent>
        </Card>
        <Card className="bg-black/20 border-white/5 backdrop-blur-md hover:border-purple-500/30 transition-colors shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-black/10">
            <CardTitle className="text-sm font-medium text-slate-300">Settlement Success Rate</CardTitle>
            <div className="bg-black/50 p-2 rounded-lg border border-white/5">
              <Target className="w-4 h-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-white">{data.metrics.successRate}%</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{data.metrics.firewallBlocked} blocked by firewall</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="border-b border-white/5 bg-black/10">
            <CardTitle className="text-slate-100">Daily Task Volume</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tasksByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f1015', borderColor: 'rgba(255,255,255,0.1)' }} />
                <Bar dataKey="tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="border-b border-white/5 bg-black/10">
            <CardTitle className="text-slate-100">Service Demand</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.serviceDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f1015', borderColor: 'rgba(255,255,255,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
