// src/controllers/contentController.js
import {
  createDocument,
  deleteDocumentById,
  getDb,
  getDocumentById,
} from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "message";

export const messageController = {
  async getAll(page, limit) {
    try {
      console.log("Connecting to MongoDB...");
      const db = await getDb();

      const skip = (page - 1) * limit;
      const total = await db.collection(COLLECTION_NAME).countDocuments({});

      console.log("Fetching contacts...");

      const contents = await db
        .collection(COLLECTION_NAME)
        .find({})
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
      throw new Error("Lỗi khi lấy danh sách tin nhắn");
    }
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
