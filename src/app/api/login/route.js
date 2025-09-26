// File: src/app/api/login/route.js
import { getDb } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Vui lòng điền đầy đủ email và mật khẩu' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Connecting to MongoDB...');
    const db = await getDb();
    console.log('Connected to MongoDB');

    console.log('Checking user:', email);
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Email hoặc mật khẩu không đúng' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Email hoặc mật khẩu không đúng' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Đăng nhập thành công', userId: user._id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in /api/login:', e);
    return new Response(JSON.stringify({ error: 'Lỗi máy chủ nội bộ', details: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}