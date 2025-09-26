import {
  getDocumentById,

  updateDocumentById,
  deleteDocumentById,
  getDb,
  createDocument,
} from "../mongodb";

const COLLECTION = "publication";

export async function createPublication(data) {
  const doc = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await createDocument(COLLECTION, doc);
  return { _id: result.insertedId, ...doc };
}

export async function getPublicationById(id) {
  return await getDocumentById(COLLECTION, id);
}

export async function updatePublication(id, data) {
  return await updateDocumentById(COLLECTION, id, { ...data, updatedAt: new Date() });
}

export async function deletePublication(id) {
  return await deleteDocumentById(COLLECTION, id);
}

export async function getAllPublications(limit = 50) {
  const db = await getDb();
  return await db.collection(COLLECTION).find().sort({ createdAt: -1 }).limit(limit).toArray();
}
