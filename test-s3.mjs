import { S3Client, PutObjectCommand, GetBucketLocationCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "AKIA2KNM4SMHEHOXTCNT",
    secretAccessKey: "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",
  },
});

async function run() {
  const bucketName = "gogul-files-01";
  
  try {
    console.log("Testing Bucket Region...");
    // Try to get bucket location (this might fail if the user doesn't have permission)
    const clientForLocation = new S3Client({
      region: "us-east-1", // Standard region for location requests
      credentials: {
        accessKeyId: "AKIA2KNM4SMHEHOXTCNT",
        secretAccessKey: "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",
      },
    });
    
    // Attempting a simple list or put
    console.log("Attempting test upload to S3 directly via Node...");
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: "test-upload.txt",
      Body: "Hello World",
      ContentType: "text/plain",
    });

    await s3Client.send(command);
    console.log("✅ Server-side upload succeeded! The issue is strictly browser CORS.");
  } catch (error) {
    console.error("❌ Request Failed:", error.name, error.message);
    if (error.$metadata) console.error("Status:", error.$metadata.httpStatusCode);
  }
}

run();
