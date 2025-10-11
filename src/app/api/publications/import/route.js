import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { clientPromise } from "@/lib/mongodb"; // hoặc file getDb của bạn

export async function POST(req) {
  try {
    const body = await req.json();
    const publications = body.publications; // <- lấy đúng key

    if (!Array.isArray(publications) || publications.length === 0) {
      return NextResponse.json({ error: "No publications provided" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(); // chọn database mặc định

    // Chuẩn bị dữ liệu trước khi insert
    const preparedData = publications.map(pub => ({
      _id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      year: pub.year,
      title: pub.title,
      members: pub.members,
      type: (pub.type || "journal").toLowerCase(),
      venueName: pub.venueName || pub.venuename || "", // dùng fallback
      abstract: pub.abstract || "",
      doi: pub.doi || ""
    }));


    // Insert nhiều publications
    const result = await db.collection("publication").insertMany(preparedData);

    return NextResponse.json({ insertedCount: result.insertedCount });
  } catch (err) {
    console.error("Error importing publications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
