import { getDocumentById, deleteDocumentById, getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/content/:id
export async function GET(req, context) {
  const { id } = context.params;

  const account = await getDocumentById("content", id);
  if (!account) {
    return new Response(JSON.stringify({ message: "Không tìm thấy bài viết" }), { status: 404 });
  }

  return new Response(JSON.stringify(account), { status: 200 });
}

// DELETE /api/content/:id
export async function DELETE(req, context) {
  const { id } = context.params;

  const result = await deleteDocumentById("content", id);
  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ message: "Không tìm thấy bài viết" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

// PUT /api/content/:id
export async function PUT(req, context) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const db = await getDb();
    const result = await db.collection("content").updateOne(
      { _id: id },
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
