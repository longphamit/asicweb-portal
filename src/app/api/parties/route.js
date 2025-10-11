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
    const formData = await req.formData();
    const imageFile = formData.get("image");

    const partyData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role: formData.get("role"),
      position: formData.get("position"),
      type: formData.get("type"),
    };

    const newPartyId = await createParty(partyData, imageFile);
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
