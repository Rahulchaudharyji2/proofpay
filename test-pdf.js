const fs = require('fs');
const pdfParse = require('pdf-parse');

async function main() {
  const cid = "Qmaod3bu8JietSyGMRMdxzyDoDnpzTDuTEvia1NfAr2uxB";
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  console.log("Fetching from", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.log("Buffer size:", buffer.length);
      
      const isPdf = buffer.toString('utf-8', 0, 4) === "%PDF";
      console.log("Is PDF signature?", isPdf);
      
      try {
        const data = await pdfParse(buffer);
        console.log("Parsed Text snippet:", data.text.substring(0, 100));
      } catch (err) {
        console.error("PDF Parse error:", err);
      }
    } else {
      console.log("Response text:", await res.text());
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
main();
