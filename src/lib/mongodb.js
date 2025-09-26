// File: src/lib/mongodb.js
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from "uuid";


const uri = process.env.MONGODB_URI;
const options = {};
const DATABASE_NAME = 'admin'; // Chỉ định cơ sở dữ liệu 'admin' một lần

let client;
let clientPromise;
let db;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Hàm tiện ích để lấy cơ sở dữ liệu
export async function getDb() {
  if (!db) {
    const client = await clientPromise;
    db = client.db(DATABASE_NAME);
  }
  return db;
}

export async function createDocument(collectionName, data) {
  const db = await getDb();
  const doc = {
    _id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
  const result = await db.collection(collectionName).insertOne(doc);
  return result.insertedId; // trả về _id đã tạo
}

// getById 
export async function getDocumentById(collectionName, id) {
  const db = await getDb();
  const document = await db.collection(collectionName).findOne({ _id: id });
  return document;
}

// getAll
export async function getAllDocuments(collectionName) {
  const db = await getDb();
  const documents = await db.collection(collectionName).find({}).toArray();
  return documents;
}

// updateById
export async function updateDocumentById(collectionName, id, updateData) {
  const db = await getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: id },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

// deleteById
export async function deleteDocumentById(collectionName, id) {
  const db = await getDb();
  const result = await db.collection(collectionName).deleteOne({ _id: id });
  return result.deletedCount > 0;
}

// update field by id
export async function updateFieldById(collectionName, id, fields) {
  const db = await getDb();
  const result = await db.collection(collectionName).updateOne(
    { _id: id },
    { $set: { ...fields, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

export { clientPromise };