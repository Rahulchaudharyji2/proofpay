import { prisma } from "@/lib/db/prisma";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // 1. Fetch total tasks
  const totalTasks = await prisma.task.count();

  // 2. Fetch total spend (sum of paymentAmount where it exists)
  const tasksWithPayments = await prisma.task.findMany({
    where: { paymentAmount: { not: null } },
    select: { paymentAmount: true }
  });
  const totalSpend = tasksWithPayments.reduce((acc, curr) => acc + (curr.paymentAmount || 0), 0);

  // 3. Success rate (tasks SETTLED vs total)
  const settledTasks = await prisma.task.count({ where: { status: "SETTLED" } });
  const successRate = totalTasks > 0 ? ((settledTasks / totalTasks) * 100).toFixed(1) : 0;

  // 4. Firewall blocked
  const firewallBlocked = await prisma.securityEvent.count({ where: { severity: "HIGH" } });

  // 5. Service Distribution
  const tasks = await prisma.task.findMany({ select: { serviceType: true, createdAt: true } });
  
  const serviceCounts: Record<string, number> = {};
  tasks.forEach(t => {
    serviceCounts[t.serviceType] = (serviceCounts[t.serviceType] || 0) + 1;
  });
  
  const serviceDistribution = Object.entries(serviceCounts).map(([name, value]) => ({
    name,
    value
  }));

  // 6. Tasks by day (Last 7 days)
  const tasksByDayMap: Record<string, number> = {};
  
  // Initialize last 7 days to 0
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    tasksByDayMap[dayStr] = 0;
  }

  tasks.forEach(t => {
    const dayStr = t.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
    if (tasksByDayMap[dayStr] !== undefined) {
      tasksByDayMap[dayStr]++;
    }
  });

  const tasksByDay = Object.entries(tasksByDayMap).map(([name, count]) => ({
    name,
    tasks: count
  }));

  const data = {
    metrics: {
      totalTasks,
      totalSpend,
      successRate,
      firewallBlocked
    },
    serviceDistribution,
    tasksByDay
  };

  return <AnalyticsClient data={data} />;
}
