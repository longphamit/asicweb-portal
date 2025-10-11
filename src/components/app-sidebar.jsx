"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconFolder,
  IconDatabase,
  IconInnerShadowTop,
  IconBook, // 📚 icon cho Courses
} from "@tabler/icons-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function NavMain({ items }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link href={item.url} className="flex items-center gap-2">
              <item.icon className="size-5" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }) {
  const { data: session } = useSession();
  const party = session?.user?.party;
  const user = {
    name: party?.name || "User",
    email: session?.user?.email || "",
    avatar: party?.avatar || "/avatars/shadcn.jpg",
  };

  // ✅ Thêm Courses vào menu chính
  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Profile", url: "/dashboard/parties", icon: IconListDetails },
    { title: "News", url: "/dashboard/news", icon: IconChartBar },
    { title: "Publications", url: "/dashboard/publications", icon: IconFolder },
    { title: "Courses", url: "/dashboard/courses", icon: IconBook }, // 📚 Courses mới thêm
  ];

  const documents = [
    { name: "Data", url: "/dashboard/data", icon: IconDatabase },
  ];

  const navSecondary = [
    { title: "Settings", url: "/settings", icon: IconFolder },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">ASICLAB</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
