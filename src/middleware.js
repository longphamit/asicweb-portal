import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const url = req.nextUrl.clone();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Nếu chưa đăng nhập và vào /dashboard/* thì redirect về /login
  if (!token && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ Nếu đã đăng nhập và truy cập trang gốc "/" thì redirect sang /dashboard
  if (url.pathname === "/") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ✅ Áp dụng middleware cho cả /dashboard/* và /
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
