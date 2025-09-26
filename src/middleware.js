import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Nếu chưa đăng nhập và vào /dashboard/* thì redirect về login
  if (!token && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Áp dụng middleware cho các route cần bảo vệ
export const config = {
  matcher: ["/dashboard/:path*"], // tất cả route dưới /dashboard
};
