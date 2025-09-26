// src/controllers/contentController.js
import { createDocument, deleteDocumentById, getAllDocuments, getDb, getDocumentById } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { da } from "zod/v4/locales";

const COLLECTION_NAME = "content";

export const contentController = {
  async getAll() {
    try {
        console.log("Connecting to MongoDB...");
        const db = await getDb();
    
        console.log("Fetching accounts...");
        const accounts = await db
          .collection(COLLECTION_NAME)
          .find({})
          .project({ content: 0 }) // 👈 0 = loại bỏ trường content
          .limit(50)
          .toArray();
    
        return accounts;
      } catch (e) {
        console.error("Error in getAccounts:", e);
        throw new Error("Lỗi khi lấy danh sách tài khoản");
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
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } }
    );
    return result;
  },

  async delete(id) {
    return await deleteDocumentById(COLLECTION_NAME, id);
  },
};
