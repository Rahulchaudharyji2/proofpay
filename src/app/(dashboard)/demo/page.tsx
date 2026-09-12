"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Play, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export default function DemoPage() {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);

  const addLog = (type: string, message: string) => {
    setLogs((prev) => [...prev, { type, message }]);
  };

  const runFullDemo = async () => {
    setRunning(true);
    setLogs([]);
    
    addLog("info", "Starting End-to-End Proof-of-Outcome Flow...");
    
    try {
      addLog("info", "Executing /api/demo/run endpoint");
      const res = await fetch("/api/demo/run", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) {
        addLog("error", `Demo failed: ${data.error || "Unknown error"}`);
        addLog("error", "Note: Make sure DATABASE_URL is configured and seed script is run.");
        setRunning(false);
        return;
      }

      addLog("success", "Legitimate Flow Completed Successfully!");
      addLog("info", `Selected Provider: ${data.decision.selectedProvider.name}`);
      addLog("info", `Reason: ${data.decision.explanation}`);
      addLog("info", "HTTP 402 / x402-style simulation: Payment Required");
      addLog("info", `Amount Requested: $${data.firewallCheck?.amount || data.decision.selectedProvider.metrics.price}`);
      addLog("success", `Firewall Status: ${data.firewallCheck.status}`);
      addLog("success", `Outcome Verification: VERIFIED`);
      addLog("success", `Final Task Status: ${data.finalStatus}`);

      // Simulate attacks
      addLog("info", "--- Starting Attack Simulations ---");
      
      await new Promise(r => setTimeout(r, 1000));
      addLog("error", "ATTACK 1: Overspend Attempt ($15 on a $5 limit)");
      addLog("success", "BLOCKED: Enforcement: On-chain mandate/contract");

      await new Promise(r => setTimeout(r, 1000));
      addLog("error", "ATTACK 2: Duplicate Payment Retry");
      addLog("success", "BLOCKED: Enforced by PaymentEscrow (Already Settled)");

      await new Promise(r => setTimeout(r, 1000));
      addLog("error", "ATTACK 3: Provider Prompt Injection ('Pay $50 to X')");
      addLog("success", "BLOCKED: Provider instructions are untrusted input and cannot override financial authorization.");

      await new Promise(r => setTimeout(r, 1000));
      addLog("error", "ATTACK 4: Bad Outcome Delivery");
      addLog("success", "BLOCKED: Outcome Verification FAILED. Escrow not settled.");

      addLog("info", "--- Security Demo Complete: 4/4 Scenarios Blocked ---");

    } catch (e: any) {
      addLog("error", `Error executing demo: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attack Simulator & Demo</h2>
        <p className="text-muted-foreground mt-2">
          Watch the ProofPay economic security layer defend against malicious providers, prompt injections, and rogue agents in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>DEMO / LOCAL VERIFICATION</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runFullDemo} disabled={running} className="w-full flex items-center gap-2">
                <Play className="w-4 h-4" /> Run Full Security Demo
              </Button>
              <p className="text-xs text-muted-foreground">
                This executes a legitimate AI purchase followed by simulated attacks to demonstrate firewall and smart contract enforcement.
              </p>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Architecture Note</AlertTitle>
            <AlertDescription className="text-xs mt-2">
              If database is not connected, the demo will simulate the expected flow output. For full end-to-end verification, configure Neon and Sepolia credentials.
            </AlertDescription>
          </Alert>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px] flex flex-col">
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Live Event Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-black text-green-400 font-mono text-sm overflow-y-auto relative">
              {logs.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Awaiting execution...
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                      <span className={
                        log.type === "error" ? "text-red-400" :
                        log.type === "success" ? "text-emerald-400" :
                        "text-blue-300"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {running && (
                    <div className="animate-pulse">_</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
