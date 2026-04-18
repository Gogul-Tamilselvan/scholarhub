import { S3Client, GetBucketLocationCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: "AKIA2KNM4SMHEHOXTCNT",
    secretAccessKey: "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",
  },
});

async function run() {
  try {
    const command = new GetBucketLocationCommand({ Bucket: "gogul-files-01" });
    const response = await s3Client.send(command);
    console.log("ACTUAL REGION IS:", response.LocationConstraint || "us-east-1");
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
