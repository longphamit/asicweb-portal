import { getDocumentById, deleteDocumentById } from "@/lib/mongodb";

// GET /api/accounts/:id
export async function GET(req, context) {
  const { id } = await context.params;

  const account = await getDocumentById("account", id);
  if (!account) {
    return new Response(JSON.stringify({ message: "Không tìm thấy tài khoản" }), { status: 404 });
  }

  return new Response(JSON.stringify(account), { status: 200 });
}

// DELETE /api/accounts/:id
export async function DELETE(req, context) {
  const { id } = await context.params;

  const result = await deleteDocumentById("account", id);
  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ message: "Không tìm thấy tài khoản" }), { status: 404 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
