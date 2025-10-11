// lib/controllers/partyController.js
import { createDocument, getDb } from "@/lib/mongodb";
import { saveFile } from "./fileController";

const COLLECTION_NAME = "party";

/**
 * 📌 Lấy danh sách party (PERSON & ORGANIZATION)
 * Có thể kèm theo tài khoản nếu có.
 */
export async function getParties() {
  const db = await getDb();
  const parties = await db.collection(COLLECTION_NAME).aggregate([
    {
      $lookup: {
        from: "accounts",              // join sang collection accounts
        localField: "_id",
        foreignField: "partyId",
        as: "account",
      },
    },
    {
      $addFields: {
        account: { $arrayElemAt: ["$account", 0] },
      },
    },
    {
      $match: {
        "name": { $ne: "admin" }, // name ≠ 'admin'
      },
    },
    { $sort: { createdAt: -1 } },
  ]).toArray();

  return parties;
}

/**
 * 📌 Tạo mới một party với hỗ trợ upload hình ảnh
 * @param {Object} partyData - Dữ liệu của party
 * @param {File} imageFile - File hình ảnh (nếu có)
 */
export async function createParty(partyData, imageFile = null) {
  // Chỉ cho phép các loại file ảnh
  const imageId = await saveFile(imageFile, {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/gif"],
  });

  const partyDoc = {
    ...partyData,
    image: imageId, // Lưu ID của file
  };

  return createDocument(COLLECTION_NAME, partyDoc);
}

/**
 * 📌 Lấy thông tin party theo ID
 */
export async function getPartyById(partyId) {
  const db = await getDb();
  const party = await db.collection(COLLECTION_NAME).findOne({ _id: partyId });
  return party;
}
/**
 * 📌 Cập nhật trạng thái haveAccount cho party
 * @param {string} partyId - ID của party
 * @param {boolean} haveAccount - true nếu party đã có tài khoản, false nếu chưa
 */
export async function updatePartyAccountStatus(partyId, haveAccount) {
  const db = await getDb();

  const result = await db.collection(COLLECTION_NAME).updateOne(
    { _id: partyId },
    {
      $set: {
        haveAccount,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

export async function updateImage(partyId, image) {
  const db = await getDb();

  const result = await db.collection(COLLECTION_NAME).updateOne(
    { _id: partyId },
    {
      $set: {
        image,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount > 0;
}

