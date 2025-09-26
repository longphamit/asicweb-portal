// /src/app/api/news/count/route.js
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const count = await db.collection("content").countDocuments();
    return new Response(JSON.stringify({ count }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Không thể đếm số tin tức" }), { status: 500 });
  }
}
