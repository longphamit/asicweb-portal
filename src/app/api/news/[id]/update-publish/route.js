import { NextResponse } from "next/server";
import { clientPromise } from "@/lib/mongodb";

export async function PUT(req, { params }) {
  try {
    const { id } = params; // JS không cần await
    const { published } = await req.json();

    if (typeof published !== "boolean") {
      return NextResponse.json(
        { error: "Trường 'published' phải là boolean" },
        { status: 400 }
      );
    }

    const now = new Date();

    // ✅ Cập nhật ngày publish/unpublish tương ứng
    const updateData = { published };
    if (published) {
      updateData.publishedAt = now;
      updateData.unpublishedAt = null;
    } else {
      updateData.publishedAt = null;
      updateData.unpublishedAt = now;
    }

    const client = await clientPromise;
    const db = client.db();
    const result = await db
      .collection("content")
      .updateOne({ _id: id }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Cập nhật trạng thái bài viết thành công",
      published,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ", details: err.message },
      { status: 500 }
    );
  }
}
