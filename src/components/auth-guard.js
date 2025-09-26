"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login"); // chưa login -> redirect
    } else {
      setLoading(false);
    }
  }, [session, status]);

  if (loading || status === "loading") {
    return <div className="p-8 text-center text-gray-500">Đang kiểm tra quyền truy cập...</div>;
  }

  return <>{children}</>;
}
