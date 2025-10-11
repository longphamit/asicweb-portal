import { createDocument, getDocumentById } from "@/lib/mongodb";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const FILE_COLLECTION_NAME = "files";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Đảm bảo thư mục upload tồn tại
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.error("Lỗi khi tạo thư mục upload:", e);
  }
}

/**
 * 📌 Lưu file vào server và database
 * @param {File} file - File từ FormData
 * @param {Object} options - Tùy chọn bổ sung (ví dụ: maxSize, allowedTypes)
 * @returns {Promise<string|null>} - Trả về ID của file hoặc null nếu không hợp lệ
 */
export async function saveFile(file, options = {}) {
  if (!file) return null;

  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;

  // Kiểm tra kích thước file
  if (file.size > maxSize) {
    throw new Error(`File quá lớn. Kích thước tối đa là ${maxSize / (1024 * 1024)}MB`);
  }

  // Kiểm tra loại file nếu có danh sách allowedTypes
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`Loại file không được phép. Chỉ chấp nhận: ${allowedTypes.join(", ")}`);
  }

  await ensureUploadDir();

  const fileExtension = path.extname(file.name);
  const filename = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Lưu file vào server
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // Lưu metadata file
  const fileDoc = {
    _id: filename,
    filename,
    path: `/uploads/${filename}`,
    contentType: file.type,
    createdAt: new Date(),
  };

  return createDocument(FILE_COLLECTION_NAME, fileDoc);
}

/**
 * 📌 Lấy thông tin file theo ID
 * @param {string} fileId - ID của file
 * @returns {Promise<Object|null>} - Thông tin file từ collection files
 */
export async function getFileById(fileId) {
  return getDocumentById(FILE_COLLECTION_NAME, fileId);
}