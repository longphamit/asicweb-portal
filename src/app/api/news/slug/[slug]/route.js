import { getDocumentBySlug, deleteDocumentById, getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/news/:id
export async function GET(req, { params }) {
  const { slug } = await params; // ✅ phải await
  const news = await getDocumentBySlug("content", slug);
  if (!news) {
    return new Response(JSON.stringify({ message: "Không tìm thấy bài viết" }), { status: 404 });
  }
  return new Response(JSON.stringify(news), { status: 200 });
}