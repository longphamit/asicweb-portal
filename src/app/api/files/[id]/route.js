import { NextResponse } from "next/server";
import { getFileById } from "../../../../lib/controller/fileController";
import fs from "fs/promises";
import path from "path";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const fileId = params.id;
    const file = await getFileById(fileId);

    if (!file) {
      return NextResponse.json(
        { message: "Không tìm thấy file" },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), "public", file.path);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": fileBuffer.length,
        "Cache-Control": "public, max-age=86400", // Cache 1 ngày
      },
    });
  } catch (e) {
    console.error("GET /api/files error:", e);
    return NextResponse.json(
      { message: "Lỗi khi lấy file", error: e.message },
      { status: 500 }
    );
  }
}