// src/app/api/data/[id]/route.js
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, context) {
  const { params } = context;
  const id = params.id;

  // kiểm tra id hợp lệ
  if (!id) return new Response("Missing id", { status: 400 });

  try {
    const db = await getDb();
    const doc = await db.collection("dynamic_data").findOne({ _id: new ObjectId(id) });
    if (!doc) return new Response("Không tìm thấy dữ liệu", { status: 404 });

    return new Response(JSON.stringify(doc), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}


// DELETE /api/data/:id
export async function DELETE(req, context) {
  const { params } = context;
  const id = params.id;

  try {
    const db = await getDb();
    const result = await db.collection("dynamic_data").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return new Response("Không tìm thấy dữ liệu để xóa", { status: 404 });
    }
    return new Response("Xóa thành công", { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
