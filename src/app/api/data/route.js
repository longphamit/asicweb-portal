import { getDb } from "@/lib/mongodb"; // giả sử bạn có hàm getDb
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "dynamic_data";

export async function GET() {
  try {
    const db = await getDb();
    const data = await db.collection(COLLECTION_NAME).find({}).sort({ createdAt: -1 }).toArray();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const db = await getDb();
    const { filename, headers, rows } = await req.json();

    if (!filename || !headers || !rows) {
      return new Response("Missing fields", { status: 400 });
    }

    const result = await db.collection(COLLECTION_NAME).insertOne({
      filename,
      headers,
      rows,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ _id: result.insertedId }), { status: 201 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
