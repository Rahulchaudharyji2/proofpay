import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const taskId = "302efd16-d29a-4de4-8dfb-48688c33101a";
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  console.log("Task details:", task);
  
  if (task?.attachedFileCid) {
    const os = require('os');
    const path = require('path');
    const fs = require('fs');
    const tmpPath = path.join(os.tmpdir(), task.attachedFileCid);
    console.log("Does tmp file exist?", fs.existsSync(tmpPath));
    if (fs.existsSync(tmpPath)) {
      const stats = fs.statSync(tmpPath);
      console.log("File size:", stats.size);
      
      const buffer = fs.readFileSync(tmpPath);
      console.log("Buffer starts with %PDF?", buffer.toString('utf-8', 0, 4) === "%PDF");
      
      if (buffer.toString('utf-8', 0, 4) === "%PDF") {
        const pdfParse = require('pdf-parse');
        try {
          const data = await pdfParse(buffer);
          console.log("Parsed PDF text snippet:", data.text.substring(0, 100));
        } catch (e) {
          console.log("PDF parse error:", e);
        }
      }
    }
  } else {
    console.log("No attachedFileCid on task!");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
