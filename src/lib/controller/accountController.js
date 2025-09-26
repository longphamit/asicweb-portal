

const { ObjectId } = require('mongodb');
const { getDb, createDocument } = require('../mongodb');
const bcrypt = require('bcryptjs');

const COLLECTION_NAME = "account";

export async function createAccount({ partyId,username, password }) {
  try {
    console.log('CreateAccount called with:', partyId, username);
    if (!username || !password) {
      throw new Error('Vui lòng điền đầy đủ username và mật khẩu');
    }

    console.log('Connecting to MongoDB...');
    const db = await getDb();

    console.log('Checking if username exists:', username);
    const existingAccount = await db.collection(COLLECTION_NAME).findOne({ username });
    if (existingAccount) {
      throw new Error('username đã được sử dụng');
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = {
      partyId: partyId ? partyId : null,
      username,
      password: hashedPassword,
      createdAt: new Date(),
      status: 1, // active mặc định
    };

    console.log('Creating new account...');
    const resultId = await createDocument(COLLECTION_NAME, newAccount);

    return {
      success: true,
      message: 'Tạo tài khoản thành công',
      accountId: resultId,
    };
  } catch (e) {
    console.error('Error in createAccount:', e);
    throw new Error(e.message || 'Lỗi khi tạo tài khoản');
  }
}

export async function getAccounts() {
  try {
    console.log("Connecting to MongoDB...");
    const db = await getDb();

    console.log("Fetching accounts...");
    const accounts = await db
      .collection(COLLECTION_NAME)
      .find({})
      .project({ password: 0 }) // 👈 0 = loại bỏ trường password
      .limit(50)
      .toArray();

    return accounts;
  } catch (e) {
    console.error("Error in getAccounts:", e);
    throw new Error("Lỗi khi lấy danh sách tài khoản");
  }
}


export async function deleteAccount(accountId) {
  try {
    console.log("Connecting to MongoDB...");
    const db = await getDb();
    console.log("Fetching accounts...");
    // delete account by id
    const result = await db
      .collection(COLLECTION_NAME)
      .deleteOne({ _id: accountId });
  } catch (e) {
    console.error("Error in getAccounts:", e);
    throw new Error("Lỗi khi lấy danh sách tài khoản");
  }
}

export async function updateAccountStatus(accountId, newStatus) {
  try {
    if (!ObjectId.isValid(accountId)) {
      throw new Error('ID tài khoản không hợp lệ');
    }

    const db = await getDb();

    const result = await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(accountId) },
      { $set: { status: newStatus } }
    );

    if (result.modifiedCount === 0) {
      throw new Error('Không tìm thấy tài khoản hoặc trạng thái không thay đổi');
    }

    return { success: true, message: 'Cập nhật trạng thái tài khoản thành công' };
  } catch (e) {
    console.error('Error in updateAccountStatus:', e);
    throw new Error(e.message || 'Lỗi khi cập nhật trạng thái tài khoản');
  }
}
