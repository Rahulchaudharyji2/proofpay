"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CreateTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAgentId = searchParams.get("agentId");

  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [executionMode, setExecutionMode] = useState("MANUAL"); // MANUAL or AUTO
  const [formData, setFormData] = useState({
    agentId: initialAgentId || "",
    prompt: "Translate my attached document to Spanish.",
    budget: "Use Agent Limit",
    minQuality: "90",
    deadline: "30 minutes"
  });

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(data => {
        if (data.agents) {
          setAgents(data.agents);
          if (!formData.agentId && data.agents.length > 0) {
            setFormData(prev => ({ ...prev, agentId: data.agents[0].id }));
          }
        }
      });
  }, [formData.agentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let attachedFileCid = null;
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          attachedFileCid = uploadJson.cid;
        } else {
          alert("File upload failed.");
          setLoading(false);
          return;
        }
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: formData.agentId,
          prompt: formData.prompt,
          budget: formData.budget,
          minQuality: formData.minQuality,
          attachedFileCid,
          executionMode,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/tasks/${data.task.id}`);
      } else {
        alert("Error creating task: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="bg-[#0f1015] border border-white/5 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create a Task</h2>
          <p className="text-slate-400 mt-2">
            Tell your AI agent what to do. Attach files if necessary.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-lg">
          <CardHeader className="border-b border-white/5 bg-black/10">
            <CardTitle className="text-slate-100">What do you want your agent to do?</CardTitle>
            <CardDescription className="text-slate-400">Upload a file and provide instructions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Instructions</Label>
              <Textarea 
                className="text-lg p-4 min-h-[120px] bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                value={formData.prompt}
                onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                placeholder="e.g. Translate this document..." 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Attach File (Optional)</Label>
              <Input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer bg-black/40 border-white/10 text-white file:text-indigo-400 file:bg-indigo-500/10 file:border-0 hover:file:bg-indigo-500/20"
              />
              <p className="text-xs text-slate-500">Uploaded to IPFS securely via Pinata.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div className="space-y-2">
                <Label className="text-slate-300">Select Agent</Label>
                <Select value={formData.agentId} onValueChange={(val) => setFormData({...formData, agentId: val})}>
                  <SelectTrigger className="bg-black/40 border-white/10 text-white focus:ring-indigo-500">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1015] border-white/10 text-white">
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id} className="focus:bg-white/10">{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Execution Mode</Label>
                <Select value={executionMode} onValueChange={setExecutionMode}>
                  <SelectTrigger className="bg-black/40 border-white/10 text-white focus:ring-indigo-500">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1015] border-white/10 text-white">
                    <SelectItem value="MANUAL" className="focus:bg-white/10">Step-by-Step (Manual Audit)</SelectItem>
                    <SelectItem value="AUTO" className="focus:bg-white/10">Fully Automatic (Background)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={loading || !formData.agentId} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {loading ? "Processing..." : "Submit Task →"}
          </Button>
        </div>
      </form>
    </div>
  );
}
