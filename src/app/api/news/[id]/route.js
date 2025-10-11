import { getDocumentById, deleteDocumentById, getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/news/:id
export async function GET(req, { params }) {
  const { id } = await params; // ✅ phải await
  const account = await getDocumentById("content", id);
  if (!account) {
    return new Response(JSON.stringify({ message: "Không tìm thấy bài viết" }), { status: 404 });
  }
  return new Response(JSON.stringify(account), { status: 200 });
}

// DELETE /api/news/:id
export async function DELETE(req, { params }) {
  const { id } = await params;
  const result = await deleteDocumentById("content", id);
  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ message: "Không tìm thấy bài viết" }), { status: 404 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// PUT /api/news/:id
export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const db = await getDb();
    const result = await db.collection("content").updateOne(
      { _id: id }, // ✅ convert id sang ObjectId
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Không tìm thấy bài viết" }), { status: 404 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
