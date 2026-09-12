import crypto from "crypto";

export async function uploadJSONToPinata(jsonData: any): Promise<{ cid: string; hash: string }> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error("PINATA_JWT environment variable not set");
  }

  // Canonicalize data and create a deterministic hash
  const jsonString = JSON.stringify(jsonData);
  const hash = "0x" + crypto.createHash("sha256").update(jsonString).digest("hex");

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: jsonData,
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to upload to Pinata: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return { cid: data.IpfsHash, hash };
}
