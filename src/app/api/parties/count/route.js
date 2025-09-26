// /src/app/api/party/count/route.js
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const count = await db.collection("party").countDocuments();
    return new Response(JSON.stringify({ count }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Không thể đếm số hồ sơ" }), { status: 500 });
  }
}
