import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.PINATA_JWT) {
      return NextResponse.json({ error: "PINATA_JWT not configured" }, { status: 500 });
    }

    const pinataData = new FormData();
    pinataData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataData,
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const json = await res.json();
    const cid = json.IpfsHash;

    // Cache locally for instant execution (bypassing slow IPFS gateway propagation)
    try {
      const os = require('os');
      const path = require('path');
      const fs = require('fs');
      const tmpPath = path.join(os.tmpdir(), cid);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(tmpPath, Buffer.from(arrayBuffer));
      console.log(`Saved local cache for CID ${cid} to ${tmpPath}`);
    } catch (e) {
      console.error("Failed to save local cache", e);
    }

    return NextResponse.json({ cid });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
