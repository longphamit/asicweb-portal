// src/controllers/contentController.js
import {
  createDocument,
  deleteDocumentById,
  getDb,
  getDocumentById,
} from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "device";

export const deviceController = {
  async getAll(page = 1, limit = 10) {
    try {
      console.log("Connecting to MongoDB...");
      const db = await getDb();

      const skip = (page - 1) * limit;
      const total = await db.collection(COLLECTION_NAME).countDocuments({});

      console.log("Fetching contents...");

      const contents = await db
        .collection(COLLECTION_NAME)
        .find({})
        .project({ content: 0 }) // 👈 loại bỏ trường content
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();

      return {
        data: contents,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (e) {
      console.error("Error in getAll:", e);
      throw new Error("Lỗi khi lấy danh sách nội dung");
    }
  },

  async getPublished(page = 1, limit = 10) {
    try {
      console.log("Connecting to MongoDB...");
      const db = await getDb();

      const skip = (page - 1) * limit;
      const total = await db
        .collection(COLLECTION_NAME)
        .countDocuments({ published: true });

      console.log("Fetching published contents...");
      const contents = await db
        .collection(COLLECTION_NAME)
        .find({ published: true }) // ✅ lọc theo trạng thái đã xuất bản
        .project({ content: 0 })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();

      return {
        data: contents,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (e) {
      console.error("Error in getPublished:", e);
      throw new Error("Lỗi khi lấy danh sách nội dung đã xuất bản");
    }
  },

  async getPublishedByIds(ids) {
    try {
      console.log("Connecting to MongoDB...");
      const db = await getDb();
      console.log("Fetching published contents by ids...");
      const contents = await db
        .collection(COLLECTION_NAME)
        .find({ published: true,_id: { $in: ids } }) // ✅ lọc theo trạng thái đã xuất bản
        .project({ content: 0 })
        .limit(5)
        .sort({ createdAt: -1 })
        .toArray();
      return contents;
    } catch (e) {
      console.error("Error in getPublished:", e);
      throw new Error("Lỗi khi lấy danh sách nội dung đã xuất bản");
    }
  },

  async getById(id) {
    const content = await getDocumentById(COLLECTION_NAME, id);
    return content;
  },

  async create(data) {
    return await createDocument(COLLECTION_NAME, data);
  },

  async update(id, data) {
    const db = await getDb();
    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: id },
      { $set: { ...data, updatedAt: new Date() } }
    );
    return result;
  },

  async delete(id) {
    return await deleteDocumentById(COLLECTION_NAME, id);
  },
};
