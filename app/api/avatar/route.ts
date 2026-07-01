import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireUserId, isErrorResponse, jsonError } from "@/lib/api-utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (isErrorResponse(userId)) return userId;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return jsonError(400, "No file provided");
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return jsonError(400, "Unsupported file type. Use PNG, JPEG, WEBP, or GIF.");
  }
  if (file.size > MAX_BYTES) {
    return jsonError(400, "File is too large (max 5MB)");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${userId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  const avatarUrl = `/uploads/avatars/${filename}`;
  return NextResponse.json({ avatarUrl });
}
