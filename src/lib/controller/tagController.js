import {
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
  getDb,
  createDocument,
} from "../mongodb";

const COLLECTION = "tag";

// Helper function để tạo slug từ tiếng Việt
function generateSlug(text) {
  let slug = text.trim().toLowerCase();
  
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');
  
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/\s+/g, '-');
  slug = slug.replace(/-+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}

export async function createTag(data) {
  const trimmedName = data.name.trim();
  const id = generateSlug(trimmedName);
  
  const doc = {
    _id: id,
    name: trimmedName,
    description: data.description?.trim() || "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  if (data.referType && data.referId) {
    const fieldName = `${data.referType}_id`;
    doc[fieldName] = Array.isArray(data.referId) ? data.referId : [data.referId];
  }
  
  const db = await getDb();
  await db.collection(COLLECTION).insertOne(doc);
  return doc;
}

export async function getTagById(id) {
  return await getDocumentById(COLLECTION, id);
}

export async function updateTag(id, data) {
  const updateData = { ...data, updatedAt: new Date() };
  if (updateData.name) {
    updateData.name = updateData.name.trim();
  }
  if (updateData.description) {
    updateData.description = updateData.description.trim();
  }
  
  return await updateDocumentById(COLLECTION, id, updateData);
}

export async function deleteTag(id) {
  return await deleteDocumentById(COLLECTION, id);
}

export async function getAllTags(limit = 50) {
  const db = await getDb();
  return await db.collection(COLLECTION).find().sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function getTagsByIds(ids) {
  const db = await getDb();
  return await db.collection(COLLECTION).find({ _id: { $in: ids } }).toArray();
}

// Lấy danh sách tag IDs theo resource ID và type
export async function getReferIdsByType(resourceId, type) {

  console.log("Getting refer IDs for resource:", resourceId, "of type:", type);

  const db = await getDb();
  const fieldName = `${type}_id`;
  
  const tags = await db.collection(COLLECTION).find(
    { [fieldName]: resourceId },
    { projection: { _id: 1 } }
  ).toArray();
  
  return tags.map(tag => tag._id);
}

// Thêm ID vào tag
export async function addReferToTag(tagId, type, referId) {
  const db = await getDb();
  const fieldName = `${type}_id`;
  
  return await db.collection(COLLECTION).updateOne(
    { _id: tagId },
    { 
      $addToSet: { [fieldName]: referId },
      $set: { updatedAt: new Date() }
    }
  );
}

// Xóa ID khỏi tag
export async function removeReferFromTag(tagId, type, referId) {
  const db = await getDb();
  const fieldName = `${type}_id`;
  
  return await db.collection(COLLECTION).updateOne(
    { _id: tagId },
    { 
      $pull: { [fieldName]: referId },
      $set: { updatedAt: new Date() }
    }
  );
}