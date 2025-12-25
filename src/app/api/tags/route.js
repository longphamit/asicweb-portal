import { NextResponse } from "next/server";
import {
  createTag,
  getTagById,
  updateTag,
  deleteTag,
  getAllTags,
  getReferIdsByType,
  addReferToTag,
  removeReferFromTag,
} from "../../../lib/controller/tagController.js";

// GET /api/tags - Lấy tất cả tags
// GET /api/tags?id=vi-mach - Lấy tag theo ID
// GET /api/tags?id=vi-mach&type=news - Lấy danh sách news IDs của tag
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit")) || 50;

    // Lấy danh sách IDs theo type
    if (id && type) {
      const referIds = await getReferIdsByType(id, type);
      return NextResponse.json({ referIds });
    }

    // Lấy tag theo ID
    if (id) {
      const tag = await getTagById(id);
      if (!tag) {
        return NextResponse.json({ error: "Tag not found" }, { status: 404 });
      }
      return NextResponse.json(tag);
    }

    // Lấy tất cả tags
    const tags = await getAllTags(limit);
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

// POST /api/tags - Tạo tag mới
// POST /api/tags?action=add - Thêm referId vào tag
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const data = await request.json();

    // Thêm referId vào tag
    if (action === "add") {
      const { tagId, type, referId } = data;
      
      if (!tagId || !type || !referId) {
        return NextResponse.json(
          { error: "tagId, type, and referId are required" },
          { status: 400 }
        );
      }

      const result = await addReferToTag(tagId, type, referId);
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Tag not found" }, { status: 404 });
      }

      return NextResponse.json({ message: "Refer added successfully" });
    }

    // Tạo tag mới
    if (!data.name) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const tag = await createTag(data);
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}

// PUT /api/tags?id=vi-mach - Update tag
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    const data = await request.json();
    const result = await updateTag(id, data);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tag updated successfully" });
  } catch (error) {
    console.error("Error updating tag:", error);
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

// DELETE /api/tags?id=vi-mach - Xóa tag
// DELETE /api/tags?id=vi-mach&action=remove - Xóa referId khỏi tag
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 });
    }

    // Xóa referId khỏi tag
    if (action === "remove") {
      const { type, referId } = await request.json();
      
      if (!type || !referId) {
        return NextResponse.json(
          { error: "type and referId are required" },
          { status: 400 }
        );
      }

      const result = await removeReferFromTag(id, type, referId);
      
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Tag not found" }, { status: 404 });
      }

      return NextResponse.json({ message: "Refer removed successfully" });
    }

    // Xóa tag
    const result = await deleteTag(id);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}