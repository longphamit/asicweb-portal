import { getDocumentById, updateFieldById, deleteDocumentById } from "@/lib/mongodb";

// GET /api/parties/:id
export async function GET(req, context) {
  const { id } = await context.params;

  const party = await getDocumentById("party", id);
  if (!party) {
    return new Response(JSON.stringify({ message: "Không tìm thấy hồ sơ" }), { status: 404 });
  }
  return new Response(JSON.stringify(party), { status: 200 });
}

// PATCH /api/parties/:id
export async function PATCH(req, context) {
  const { id } = await context.params;
  const body = await req.json();
  const { accountId, haveAccount } = body;

  const updateData = {};
  if (accountId !== undefined) updateData.accountId = accountId;
  if (haveAccount !== undefined) updateData.haveAccount = haveAccount;

  if (Object.keys(updateData).length === 0) {
    return new Response(JSON.stringify({ message: "Dữ liệu không hợp lệ" }), { status: 400 });
  }

  const result = await updateFieldById("party", id, updateData);
  if (result.matchedCount === 0) {
    return new Response(JSON.stringify({ message: "Không tìm thấy hồ sơ" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Cập nhật thành công" }), { status: 200 });
}

// DELETE /api/parties/:id
export async function DELETE(req, context) {
  const { id } = await context.params;

  const result = await deleteDocumentById("party", id);
  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ message: "Không tìm thấy hồ sơ" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
