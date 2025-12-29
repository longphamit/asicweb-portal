// src/app/news/route.js
import { NextResponse } from "next/server";
import { messageController }  from '../../../lib/controller/messageController';


// Cấu hình các Header chung
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://asic.uit.edu.vn",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 🛡️ Xử lý Preflight Request (Bắt buộc cho PUT/DELETE)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET(req) {
  try {
    // 🔍 Lấy query params từ URL   published
    const { searchParams } = new URL(req.url);
   
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // 📜 Gọi controller với phân trang
    const contents = await messageController.getAll(page, limit);

    return NextResponse.json(contents);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nội dung:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const result = await messageController.create(body);
    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const result = await messageController.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    const result = await messageController.delete(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
