import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: providerId } = await params;
    const body = await req.json();
    const { taskId, service, input, paymentId } = body;

    if (!taskId || !service) {
      return NextResponse.json({ error: "Missing taskId or service" }, { status: 400 });
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: { metrics: true }
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const price = provider.metrics?.price || 0.1;

    // 1. HTTP 402 Payment Required Logic
    if (!paymentId) {
      // The client hasn't paid yet
      return NextResponse.json(
        {
          error: "Payment Required",
          taskId,
          service,
          amount: price,
          paymentRequired: true,
          message: "HTTP 402 / x402-style simulation"
        },
        { status: 402 }
      );
    }

    // 2. Verify Payment (Simulation of checking the Escrow contract or our DB)
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.paymentId !== paymentId || task.status !== "ESCROWED") {
      return NextResponse.json({ error: "Invalid or unverified payment" }, { status: 403 });
    }

    // 3. Generic Service Execution Engine
    let result = "";
    
    try {
      let documentText = "";
      let contentType = "";
      let rawBuffer: Buffer | null = null;
      
      // Always fetch the document if attached
      if (task?.attachedFileCid) {
        const cid = task.attachedFileCid;
        try {
          const os = require('os');
          const path = require('path');
          const fs = require('fs');
          const tmpPath = path.join(os.tmpdir(), cid);
          
          if (fs.existsSync(tmpPath)) {
             console.log(`Reading CID ${cid} from local cache...`);
             rawBuffer = fs.readFileSync(tmpPath);
             // Guess content type from local file (we just check PDF signature later anyway)
          } else {
            console.log(`CID ${cid} not in local cache, racing IPFS gateways...`);
            const gateways = [
              `https://gateway.pinata.cloud/ipfs/${cid}`,
              `https://ipfs.io/ipfs/${cid}`,
              `https://dweb.link/ipfs/${cid}`
            ];
            
            const fetchWithTimeout = (url: string) => {
              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), 8000);
              return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
            };
  
            const ipfsRes = await Promise.any(gateways.map(fetchWithTimeout));
            
            if (ipfsRes.ok) {
              contentType = ipfsRes.headers.get("content-type") || "";
              rawBuffer = Buffer.from(await ipfsRes.arrayBuffer());
            }
          }
          
          if (rawBuffer) {
            if (contentType.includes("pdf") || rawBuffer.toString('utf-8', 0, 4) === "%PDF") {
              const pdfParse = require("pdf-parse");
              const pdfData = await pdfParse(rawBuffer);
              if (pdfData && pdfData.text) documentText = pdfData.text.trim();
            } else {
              documentText = rawBuffer.toString('utf-8').trim();
            }
          }
        } catch (ipfsErr) {
          console.error("Failed to fetch/parse IPFS document", ipfsErr);
        }
      }

      const isTranslationRequest = input?.toLowerCase().includes("translate") || input?.toLowerCase().includes("traducir");
      const wantsToTranslateDoc = isTranslationRequest && documentText.length > 0;

      if (wantsToTranslateDoc) {
        // PRODUCTION STYLE: Free Translation API (MyMemory)
        let targetLang = "es"; // default Spanish
        if (input?.toLowerCase().includes("french")) targetLang = "fr";
        if (input?.toLowerCase().includes("german")) targetLang = "de";
        if (input?.toLowerCase().includes("hindi")) targetLang = "hi";
        
        const safeText = documentText.length > 400 ? documentText.substring(0, 400) + "..." : documentText;
        
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(safeText)}&langpair=en|${targetLang}`);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
          result = `[REAL DOCUMENT TRANSLATION via ${provider.name}]:\n\n"${data.responseData.translatedText}"\n\n(Translated from uploaded document)`;
        } else {
          throw new Error("Translation API returned invalid data");
        }
      } else if (process.env.AI_API_KEY) {
        // General Purpose AI Inference
        const { GoogleGenAI } = require("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
        
        let promptText = `You are a Web3 AI Agent executing a task for a user. Please follow their instruction carefully: "${input}"\n\nProvide ONLY the final output directly.`;
        
        if (documentText) {
          promptText += `\n\nThe user has provided the following document content for you to process:\n"""\n${documentText.substring(0, 3000)}\n"""`;
        } else if (rawBuffer) {
          promptText += `\n\nThe user has attached a document, but its text could not be extracted manually. Please read the attached document and process it.`;
        }

        const contents: any[] = [{ text: promptText }];

        // Pass the raw buffer to Gemini natively if available
        if (rawBuffer) {
           const mime = contentType.includes("pdf") || rawBuffer.toString('utf-8', 0, 4) === "%PDF" ? "application/pdf" : "text/plain";
           contents.push({
             inlineData: {
               data: rawBuffer.toString("base64"),
               mimeType: mime
             }
           });
        }

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contents,
        });
        
        result = `[AI AGENT EXECUTION via ${provider.name}]:\n\n${aiResponse.text || "No response generated by AI."}`;
      } else {
        result = `[Simulated Execution]: Successfully processed request. (AI_API_KEY missing, and not a document translation request)`;
      }
    } catch (e: any) {
      console.error("Provider Execution Failed:", e);
      result = `Execution failed: ${e.message}`;
    }

    // Generate evidence
    const resultHash = crypto.createHash('sha256').update(result).digest('hex');
    const evidenceCid = `QmSimulatedEvidence${Date.now()}`; // Simulated IPFS CID

    return NextResponse.json({
      taskId,
      providerId,
      result,
      resultHash,
      evidenceCid,
      status: "SUCCESS"
    });

  } catch (error: any) {
    console.error("Provider API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
