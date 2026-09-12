"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight, Loader2 } from "lucide-react";

export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [taskResult, setTaskResult] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${id}/status`); // We'll need this GET route or use a generic one
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch, we can just fetch all info from a new route /api/tasks/[id]/details
    fetch(`/api/tasks/${id}/details`)
      .then(r => r.json())
      .then(data => {
        setTask(data.task);
        if (data.task?.status === "SETTLED") {
           // We could fetch the outcome from Pinata using the CID, but for now we'll just rely on the execute route setting it in state
        }
        setLoading(false);
      });
  }, [id]);

  // Frontend Orchestrator for AUTO mode
  useEffect(() => {
    if (!task || executing) return;

    if (task.executionMode === "AUTO") {
      if (task.status === "CREATED") {
        setTimeout(() => {
          runDecision();
        }, 1000); // Small delay to let the user read the log
      } else if (task.status === "PROVIDER_SELECTED") {
        setTimeout(() => {
          runExecution();
        }, 1000);
      }
    }
  }, [task, executing]);

  const runDecision = async () => {
    setExecuting(true);
    setLogs(prev => [...prev, "Running AI Provider Decision Engine..."]);
    const res = await fetch(`/api/tasks/${id}/decision`, { method: "POST" });
    if (res.ok) {
      setLogs(prev => [...prev, "Provider selected successfully."]);
      const data = await res.json();
      setTask(data.task);
    } else {
      setLogs(prev => [...prev, "Failed to select provider."]);
    }
    setExecuting(false);
  };

  const runExecution = async () => {
    setExecuting(true);
    setLogs(prev => [...prev, "Initiating HTTP 402 Flow with Provider..."]);
    const res = await fetch(`/api/tasks/${id}/execute`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setLogs(prev => [...prev, "Service Executed and Settled Successfully!"]);
      setTask(data.task);
      if (data.result) setTaskResult(data.result);
    } else {
      setLogs(prev => [...prev, `Execution Failed: ${data.error}`]);
      fetch(`/api/tasks/${id}/details`).then(r => r.json()).then(d => setTask(d.task));
    }
    setExecuting(false);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
  if (!task) return <div className="p-8 text-center text-destructive">Task not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Details</h2>
          <p className="text-muted-foreground mt-2 font-mono text-sm">ID: {task.id}</p>
        </div>
        <div>
          <Badge variant={task.status === "SETTLED" ? "default" : task.status === "FAILED" ? "destructive" : "secondary"} className="text-sm px-3 py-1">
            {task.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: The Story */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle>What Was Bought</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg font-medium">{task.description}</p>
              <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Service: {task.serviceType}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle>AI Decision</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {task.decision ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selected Provider</span>
                    <span className="font-semibold">{task.decision.rationale.selected || task.provider?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reasoning</span>
                    <span className="text-sm max-w-sm text-right">{task.decision.rationale.reasoning}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Waiting for AI decision...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30">
              <CardTitle>Payment & Proof</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Payment Path</p>
                    <p className="font-mono text-sm mt-1 text-emerald-500">HTTP 402 → Auth → Escrow</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Amount Escrowed</p>
                    <p className="font-mono text-sm mt-1">${task.paymentAmount || "0.00"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Result Hash</p>
                    <p className="font-mono text-xs mt-1 truncate">{task.resultHash || "Pending..."}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">IPFS Evidence (CID)</p>
                    <p className="font-mono text-xs mt-1 text-blue-500 truncate">{task.resultCid || "Pending..."}</p>
                  </div>
               </div>
            </CardContent>
          </Card>

          {(task.status === "SETTLED" && taskResult) && (
            <Card className="border-emerald-500/50">
              <CardHeader className="bg-emerald-500/10">
                <CardTitle className="text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Final AI Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap font-mono">
                  {taskResult}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Controls & Lifecycle */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.status === "CREATED" && (
                <Button className="w-full" onClick={runDecision} disabled={executing}>
                  {executing ? <Loader2 className="animate-spin mr-2" /> : null}
                  1. Run AI Decision
                </Button>
              )}
              {task.status === "PROVIDER_SELECTED" && (
                <Button className="w-full" onClick={runExecution} disabled={executing}>
                  {executing ? <Loader2 className="animate-spin mr-2" /> : null}
                  2. Authorize & Pay (402)
                </Button>
              )}
              {task.status === "SETTLED" && (
                <Button className="w-full" variant="outline" disabled>
                  Task Completed Successfully
                </Button>
              )}
              
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <h4 className="text-sm font-semibold">Live Logs</h4>
                <div className="bg-muted p-3 rounded-md text-xs font-mono space-y-1 max-h-[150px] overflow-y-auto">
                  {logs.length === 0 && <span className="text-muted-foreground">No logs yet...</span>}
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifecycle Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {[
                  { step: "CREATED", label: "Task Created" },
                  { step: "PROVIDER_SELECTED", label: "AI Decided" },
                  { step: "PAYMENT_REQUIRED", label: "HTTP 402 Payment Required" },
                  { step: "AUTHORIZED", label: "Firewall & Mandate Auth" },
                  { step: "ESCROWED", label: "Funds Escrowed" },
                  { step: "DELIVERED", label: "Service Delivered" },
                  { step: "VERIFIED", label: "Outcome Verified" },
                  { step: "SETTLED", label: "Provider Settled" }
                ].map((item, idx) => {
                  // A simple way to check if we passed this status. 
                  // In a real app we might rely on AuditEvents.
                  const statusOrder = ["CREATED", "PROVIDER_SELECTED", "PAYMENT_REQUIRED", "AUTHORIZED", "ESCROWED", "DELIVERED", "VERIFIED", "SETTLED"];
                  const currentIdx = statusOrder.indexOf(task.status);
                  const itemIdx = statusOrder.indexOf(item.step);
                  const isPast = itemIdx <= currentIdx && task.status !== "FAILED";
                  const isFailedHere = task.status === "FAILED" && itemIdx === currentIdx + 1;

                  return (
                    <div key={item.step} className="flex items-center gap-3 text-sm">
                      {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : isFailedHere ? <Circle className="w-4 h-4 text-destructive fill-destructive" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                      <span className={isPast ? "font-medium" : "text-muted-foreground"}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
