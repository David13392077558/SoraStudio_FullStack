import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string = "video/mp4"
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
  });

  await r2.send(command);

  // ⭐ 使用正确的 Public URL，而不是手动拼接
  return `${process.env.R2_PUBLIC_URL}/${filename}`;
}
