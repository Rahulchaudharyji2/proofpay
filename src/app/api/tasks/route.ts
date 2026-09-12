import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, prompt, budget, minQuality, attachedFileCid, executionMode } = body;

    if (!agentId || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { mandates: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // REAL NATURAL LANGUAGE PARSING using Google Gemini
    const services = await prisma.service.findMany({ where: { active: true } });
    const serviceSlugs = services.map(s => s.slug);
    
    let serviceType = "translation"; // fallback
    let llmReasoning = "Fallback logic used";

    try {
      if (!process.env.AI_API_KEY) {
        throw new Error("AI_API_KEY not found in environment.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
      const promptText = `
        You are an autonomous purchasing agent for Web3 AI. 
        A user has given you the following task: "${prompt}"
        Available services: ${serviceSlugs.join(", ")}
        
        Analyze the task and pick the exact matching service slug from the available services.
        If nothing matches, pick the closest one or "translation" as fallback.
        
        Return ONLY a JSON object with this exact format:
        {
          "serviceType": "chosen_slug",
          "reasoning": "brief explanation of why this service matches the user's intent"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: { responseMimeType: 'application/json' }
      });
      
      const textResponse = response.text || "{}";
      const parsed = JSON.parse(textResponse);
      
      if (parsed.serviceType && serviceSlugs.includes(parsed.serviceType)) {
        serviceType = parsed.serviceType;
      }
      if (parsed.reasoning) {
        llmReasoning = parsed.reasoning;
      }
      
    } catch (llmError) {
      console.error("LLM Parsing Failed, falling back to basic matching:", llmError);
      const p = prompt.toLowerCase();
      if (p.includes("ocr") || p.includes("extract text") || p.includes("scan") || p.includes("image to text") || p.includes("document extraction")) {
        serviceType = "ocr";
      } else if (p.includes("summarize") || p.includes("summary") || p.includes("shorten")) {
        serviceType = "summarization";
      } else if (p.includes("ai") || p.includes("generate") || p.includes("write")) {
        serviceType = "ai-inference";
      } else if (p.includes("translate") || p.includes("language")) {
        serviceType = "translation";
      } else if (p.includes("store") || p.includes("save") || p.includes("upload")) {
        serviceType = "storage";
      } else if (p.includes("image") || p.includes("picture") || p.includes("draw")) {
        serviceType = "image-generation";
      } else if (p.includes("convert") || p.includes("format") || p.includes("pdf to") || p.includes("word to")) {
        serviceType = "file-conversion";
      } else if (p.includes("clean") || p.includes("csv") || p.includes("data") || p.includes("invalid rows")) {
        serviceType = "data-processing";
      }
    }

    // 1. Create the Task Intent
    const task = await prisma.task.create({
      data: {
        agentId,
        description: prompt,
        serviceType,
        status: "CREATED",
        attachedFileCid: attachedFileCid || null,
        executionMode: executionMode || "MANUAL",
      },
    });

    // We can also create a Decision record to store the intent parsing parameters
    await prisma.decision.create({
      data: {
        taskId: task.id,
        selectedProviderId: "", // Will be filled later
        rationale: {
          step: "Parsed Intent via Gemini LLM",
          parsedService: serviceType,
          llmReasoning: llmReasoning,
          requestedBudget: budget,
          requestedQuality: minQuality,
          mandateCheck: "Pending",
        }
      }
    });

    // 2. Add an Audit Event
    await prisma.auditEvent.create({
      data: {
        taskId: task.id,
        eventType: "TASK_CREATED",
        description: `Agent requested to perform: ${prompt} -> LLM determined service: ${serviceType}`,
      }
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
