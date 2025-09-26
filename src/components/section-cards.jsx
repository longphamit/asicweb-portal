"use client";

import { useEffect, useState } from "react";
import { IconPlus, IconList } from "@tabler/icons-react";
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SectionCards() {
  const router = useRouter();
  const [stats, setStats] = useState({
    parties: 0,
    publications: 0,
    news: 0,
    contacts: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [resParties, resPublications, resNews] = await Promise.all([
        fetch("/api/parties/count"),
        fetch("/api/publications/count"),
        fetch("/api/news/count"),
      ]);

      const [partiesData, publicationsData, newsData] = await Promise.all([
        resParties.ok ? resParties.json() : { count: 0 },
        resPublications.ok ? resPublications.json() : { count: 0 },
        resNews.ok ? resNews.json() : { count: 0 },
      ]);

      setStats({
        parties: partiesData?.count ?? 0,
        publications: publicationsData?.count ?? 0,
        news: newsData?.count ?? 0,
        contacts: 0,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Lỗi khi tải số liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Số lượng hồ sơ",
      value: stats.parties,
      buttons: [
        { text: "Xem", icon: <IconList className="w-4 h-4 mr-1" />, onClick: () => router.push("/dashboard/parties") },
      ],
    },
    {
      label: "Số công bố",
      value: stats.publications,
      buttons: [
        { text: "Tạo", icon: <IconPlus className="w-4 h-4 mr-1" />, onClick: () => router.push("/dashboard/publications/create") },
        { text: "Xem", icon: <IconList className="w-4 h-4 mr-1" />, onClick: () => router.push("/dashboard/publications") },
      ],
    },
    {
      label: "Số tin tức",
      value: stats.news,
      buttons: [
        { text: "Tạo", icon: <IconPlus className="w-4 h-4 mr-1" />, onClick: () => router.push("/dashboard/news/create") },
        { text: "Xem", icon: <IconList className="w-4 h-4 mr-1" />, onClick: () => router.push("/dashboard/news") },
      ],
    },
    {
      label: "Số yêu cầu liên hệ",
      value: stats.contacts,
      buttons: [
        { text: "Xem", icon: <IconList className="w-4 h-4 mr-1" />, onClick: () => router.push("/dashboard/contacts") },
      ],
    },
  ];

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Đang tải số liệu...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="@container/card flex flex-col justify-between">
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex gap-2">
            {card.buttons.map((btn, idx) => (
              <Button key={idx} size="sm" variant="outline" onClick={btn.onClick}>
                {btn.icon}
                {btn.text}
              </Button>
            ))}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
