// lib/controllers/partyController.js
import { createDocument, getDb } from "@/lib/mongodb";

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
    { $sort: { createdAt: -1 } },
  ]).toArray();

  return parties;
}

/**
 * 📌 Tạo mới một party
 */
export async function createParty(partyData) {
  return createDocument(COLLECTION_NAME, partyData);
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
