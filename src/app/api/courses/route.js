// src/app/news/route.js
import { NextResponse } from "next/server";
import { courseController }  from '../../../lib/controller/courseController';

export async function GET(req) {
  try {
    // 🔍 Lấy query params từ URL   published
    const { searchParams } = new URL(req.url);
   
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // 📜 Gọi controller với phân trang
    const contents = await courseController.getAll(page, limit);

    return NextResponse.json(contents);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nội dung:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const result = await courseController.create(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const result = await courseController.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    const result = await courseController.delete(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
