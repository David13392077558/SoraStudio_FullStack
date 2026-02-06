import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

export async function uploadToR2(buffer, filename, contentType = "video/mp4") {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });

  await r2.send(command);

  return `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${filename}`;
}
