import { getDocumentById, deleteDocumentById, getDb } from "@/lib/mongodb";

export async function GET(req, { params }) {
  const { id } = await params; // ✅ phải await
  const publication = await getDocumentById("publication", id);
  if (!publication) {
    return new Response(JSON.stringify({ message: "Không tìm thấy công bố" }), { status: 404 });
  }
  return new Response(JSON.stringify(publication), { status: 200 });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const db = await getDb();
    const result = await db.collection("publication").updateOne(
      { _id: id }, // ✅ convert id sang ObjectId
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Không tìm thấy công bố" }), { status: 404 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const result = await deleteDocumentById("publication", id);
  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ message: "Không tìm thấy công bố" }), { status: 404 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}