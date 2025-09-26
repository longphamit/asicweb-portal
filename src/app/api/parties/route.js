// app/api/parties/route.js
import { NextResponse } from "next/server";
import { createParty,getParties,updatePartyAccountStatus } from '../../../lib/controller/partyController';

export async function GET() {
  try {
    const parties = await getParties();
    return NextResponse.json(parties, { status: 200 });
  } catch (e) {
    console.error("GET /api/parties error:", e);
    return NextResponse.json(
      { message: "Lỗi khi lấy danh sách party", error: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newPartyId = await createParty(body);
    return NextResponse.json(
      { message: "Tạo party thành công", partyId: newPartyId },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/parties error:", e);
    return NextResponse.json(
      { message: "Lỗi khi tạo party", error: e.message },
      { status: 500 }
    );
  }
}

// PATCH


// DELETE
