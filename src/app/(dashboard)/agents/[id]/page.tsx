import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditMandateDialog } from "@/components/EditMandateDialog";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      mandates: true,
      tasks: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          provider: true
        }
      },
    },
  });

  if (!agent) return notFound();

  const mandate = agent.mandates[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{agent.name}</h2>
          <p className="text-muted-foreground mt-2">{agent.purpose}</p>
        </div>
        <div className="space-x-2">
          <Link href={`/tasks/create?agentId=${agent.id}`}>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">Create Task</Button>
          </Link>
          <EditMandateDialog agentId={agent.id} currentMandate={mandate} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mandate Summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Financial Mandate</CardTitle>
            <CardDescription>On-chain authorization limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-emerald-500">{mandate?.status || "NONE"}</Badge>
            </div>
            {mandate && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-mono font-medium">${mandate.totalBudget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Limit</span>
                  <span className="font-mono font-medium">${mandate.dailyLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Transaction</span>
                  <span className="font-mono font-medium">${mandate.perTransactionLimit}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-border">
                  <span className="text-sm font-semibold mb-2 block">Allowed Services</span>
                  <div className="flex flex-wrap gap-2">
                    {mandate.allowedServices.map(s => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Purchases made by this agent</CardDescription>
          </CardHeader>
          <CardContent>
            {agent.tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tasks created yet.</p>
            ) : (
              <div className="space-y-4">
                {agent.tasks.map(task => (
                  <div key={task.id} className="flex justify-between items-center p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{task.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Service: {task.serviceType} • Provider: {task.provider?.name || "Pending"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={task.status === "SETTLED" ? "default" : task.status === "FAILED" ? "destructive" : "secondary"}>
                        {task.status}
                      </Badge>
                      <p className="text-xs font-mono mt-1">${task.paymentAmount || "0.00"}</p>
                    </div>
                  </div>
                ))}
                <Link href={`/tasks?agentId=${agent.id}`}>
                  <Button variant="link" className="px-0">View all tasks →</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
