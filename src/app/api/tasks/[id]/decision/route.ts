import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { agent: { include: { mandates: true } } }
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.status !== "CREATED") return NextResponse.json({ error: "Task already processed" }, { status: 400 });

    const mandate = task.agent.mandates[0];

    // 1. Service Filter
    const service = await prisma.service.findUnique({
      where: { slug: task.serviceType },
      include: { providers: { include: { provider: { include: { metrics: true } } } } }
    });

    if (!service) return NextResponse.json({ error: "Service type not supported" }, { status: 400 });

    // 2. Fetch Providers
    const candidateProviders = service.providers.map(p => p.provider);
    
    // Default fallback logic
    let selectedProviderId = candidateProviders[0]?.id;
    let llmReasoning = "Fallback logic used due to LLM failure";
    
    // 3. AI Provider Decision Engine
    try {
      if (!process.env.AI_API_KEY) {
        throw new Error("AI_API_KEY not found in environment.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
      
      // Structure the provider data for the LLM
      const providerData = candidateProviders.map(p => ({
        id: p.id,
        name: p.name,
        price: p.metrics?.price,
        qualityScore: p.metrics?.quality,
        reliabilityScore: p.metrics?.reliability,
        latencyMs: p.metrics?.latencyMs
      }));
      
      const promptText = `
        You are an autonomous purchasing AI agent. 
        Your task is to select the BEST service provider for the current request.
        
        Task Description: "${task.description}"
        Mandate Limits: Max Per-Transaction Budget is $${mandate.perTransactionLimit}.
        
        Available Providers for this service:
        ${JSON.stringify(providerData, null, 2)}
        
        Evaluate the providers based on the task context. 
        - If the task sounds urgent, prioritize low latency.
        - If the task is critical/important, prioritize quality and reliability.
        - Ensure the price DOES NOT EXCEED the Max Per-Transaction Budget ($${mandate.perTransactionLimit}).
        
        Return ONLY a JSON object with this exact format:
        {
          "selectedProviderId": "provider_id_here",
          "reasoning": "Detailed explanation of why you chose this provider over the others, referencing their specific metrics and the user's intent."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: { responseMimeType: 'application/json' }
      });
      
      const textResponse = response.text || "{}";
      const parsed = JSON.parse(textResponse);
      
      if (parsed.selectedProviderId && candidateProviders.find(p => p.id === parsed.selectedProviderId)) {
        selectedProviderId = parsed.selectedProviderId;
      }
      if (parsed.reasoning) {
        llmReasoning = parsed.reasoning;
      }
      
    } catch (llmError) {
      console.error("LLM Provider Decision Failed, falling back:", llmError);
      // Fallback: pick the cheapest that meets basic quality
      let lowestCost = Infinity;
      candidateProviders.forEach(p => {
        if (p.metrics && p.metrics.price < lowestCost && p.metrics.quality >= 90) {
          lowestCost = p.metrics.price;
          selectedProviderId = p.id;
        }
      });
    }

    if (!selectedProviderId) {
      await prisma.task.update({ where: { id: task.id }, data: { status: "FAILED" } });
      return NextResponse.json({ error: "No eligible providers found" }, { status: 400 });
    }

    const selectedProviderName = candidateProviders.find(p => p.id === selectedProviderId)?.name || "Unknown";

    // 4. Create Decision record and update task
    const rationale = {
      taskRequirements: {
        budget: mandate?.perTransactionLimit
      },
      candidates: candidateProviders.map(p => p.name),
      selected: selectedProviderName,
      reasoning: llmReasoning
    };

    // Update existing decision if created in task route, or create new
    await prisma.decision.upsert({
      where: { taskId: task.id },
      update: {
        selectedProviderId: selectedProviderId,
        rationale: rationale,
      },
      create: {
        taskId: task.id,
        selectedProviderId: selectedProviderId,
        rationale: rationale,
      }
    });

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: {
        status: "PROVIDER_SELECTED",
        selectedProviderId: selectedProviderId
      },
      include: {
        provider: true,
      }
    });

    await prisma.auditEvent.create({
      data: {
        taskId: task.id,
        eventType: "PROVIDER_SELECTED",
        description: `Gemini AI selected ${selectedProviderName}. Reasoning: ${llmReasoning}`,
      }
    });

    return NextResponse.json({ task: updatedTask, decision: rationale });
  } catch (error: any) {
    console.error("Error making decision:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
