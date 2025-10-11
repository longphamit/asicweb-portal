import { NextResponse } from "next/server";
import { saveFile } from "../../../lib/controller/fileController";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "Không có file được gửi" },
        { status: 400 }
      );
    }

    // Lưu file với các giới hạn (ví dụ: 10MB, mọi loại file)
    const fileId = await saveFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [], // Cho phép mọi loại file (có thể thêm giới hạn nếu cần)
    });

    if (!fileId) {
      return NextResponse.json(
        { message: "Lỗi khi lưu file" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Upload file thành công", fileId },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/files error:", e);
    return NextResponse.json(
      { message: "Lỗi khi upload file", error: e.message },
      { status: 500 }
    );
  }
}