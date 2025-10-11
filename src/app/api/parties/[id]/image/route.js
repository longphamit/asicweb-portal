import { NextResponse } from "next/server";
import {  saveFile } from "../../../../../lib/controller/fileController";
import {  updateImage } from "../../../../../lib/controller/partyController";

export async function PATCH(request, context) {
  try {
   const { id } = await context.params;

    // Kiểm tra ID hợp lệ
    if (!id) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    // Lấy FormData từ request
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ error: "Vui lòng cung cấp hình ảnh" }, { status: 400 });
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Hình ảnh quá lớn, tối đa 5MB" },
        { status: 400 }
      );
    }

    // Upload file qua FileController
    const imageId = await saveFile(file, id);

    // Cập nhật party với imageId mới
    const updatedParty = await updateImage(id, imageId);

    if (!updatedParty) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ" }, { status: 404 });
    }

    return NextResponse.json(updatedParty, { status: 200 });
  } catch (error) {
    console.error("Lỗi khi cập nhật avatar:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}