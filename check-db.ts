import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const task = await prisma.task.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  console.log("Latest Task:", task);
  
  if (task && task.attachedFileCid) {
    console.log("Fetching CID:", task.attachedFileCid);
    const url = `https://gateway.pinata.cloud/ipfs/${task.attachedFileCid}`;
    const res = await fetch(url);
    console.log("Pinata Status:", res.status);
    console.log("Pinata Content-Type:", res.headers.get("content-type"));
    if (res.ok) {
       const buffer = Buffer.from(await res.arrayBuffer());
       console.log("Is PDF?", buffer.toString('utf-8', 0, 4) === "%PDF");
       if (buffer.toString('utf-8', 0, 4) === "%PDF") {
           const pdfParse = require('pdf-parse');
           try {
             const data = await pdfParse(buffer);
             console.log("PDF parsed successfully, text length:", data.text.length);
           } catch (e) {
             console.log("PDF parse failed:", e);
           }
       }
    } else {
       console.log("Pinata body:", await res.text());
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
