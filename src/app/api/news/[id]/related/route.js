import { getDocumentsByIds, getDb,getDocumentById } from "../../../../../lib/mongodb"; // Điều chỉnh path theo cấu trúc dự án
import { getReferIdsByType } from "../../../../../lib/controller/tagController";
import { contentController } from "../../../../../lib/controller/contentController";
export async function GET(request, context) {
  try {
    const params = await context.params;
    const { id } = params;

    // Lấy thông tin bài viết hiện tại từ collection "content"
    const news = await getDocumentById("content", id);
    if (!news) {
      return new Response(JSON.stringify({ error: "News not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Lấy tất cả tag liên kết với bài viết hiện tại
    const tagIds = await getReferIdsByType(id, "news");
    console.log("Tag IDs:", tagIds);

    if (!tagIds || tagIds.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Lấy tất cả bài viết có cùng tag, ngoại trừ bài viết hiện tại
    const db = await getDb();
    const relatedNewsIds = new Set();
    for (const tagId of tagIds) {
      const tags = await db.collection("tag").find(
        { _id: tagId },
        { projection: { news_id: 1 } }
      ).toArray();
      tags.forEach(tag => {
        if (tag.news_id) {
          tag.news_id.forEach(newsId => {
            if (newsId !== id) {
              relatedNewsIds.add(newsId);
            }
          });
        }
      });
    }

    // Lấy thông tin chi tiết của các bài viết liên quan từ collection "content"
    const relatedNews = await contentController.getPublishedByIds( Array.from(relatedNewsIds));

    // Lọc bỏ các kết quả null (nếu có) và sắp xếp theo ngày tạo
    const validRelatedNews = relatedNews
      .filter((news) => news !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return new Response(JSON.stringify(validRelatedNews), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching related news:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}