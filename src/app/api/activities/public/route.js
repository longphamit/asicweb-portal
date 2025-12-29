// src/app/news/route.js
import { NextResponse } from "next/server";
import { activityController }  from '../../../../lib/controller/activitiesController';

export async function GET(req) {
  try {
    // 🔍 Lấy query params từ URL   published
    const { searchParams } = new URL(req.url);
   
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // 📜 Gọi controller với phân trang
    const contents = await activityController.getPublic(page, limit);

    return NextResponse.json(contents);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nội dung:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



