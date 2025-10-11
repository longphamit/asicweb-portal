// components/app-sidebar.jsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconFolder,
  IconDatabase,
  IconInnerShadowTop,
  IconBook,
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
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        // Logic isActive: Xử lý riêng cho /dashboard
        const isActive =
          item.url === "/dashboard"
            ? pathname === "/dashboard" // Chỉ highlight khi exact match /dashboard
            : pathname === item.url ||
              (pathname.startsWith(`${item.url}/`) &&
                pathname.split("/").length === item.url.split("/").length + 1);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              variant="custom"
            >
              <Link href={item.url} className="flex items-center gap-2">
                <item.icon className="size-5" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavDocumentsWithHighlight({ items }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive =
          pathname === item.url ||
          (pathname.startsWith(`${item.url}/`) &&
            pathname.split("/").length === item.url.split("/").length + 1);

        return (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.name}
              variant="custom"
            >
              <Link href={item.url} className="flex items-center gap-2">
                <item.icon className="size-5" />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function NavSecondaryWithHighlight({ items, className }) {
  const pathname = usePathname();

  return (
    <SidebarMenu className={className}>
      {items.map((item) => {
        const isActive =
          pathname === item.url ||
          (pathname.startsWith(`${item.url}/`) &&
            pathname.split("/").length === item.url.split("/").length + 1);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.title}
              variant="custom"
            >
              <Link href={item.url} className="flex items-center gap-2">
                <item.icon className="size-5" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
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

  const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Profile", url: "/dashboard/parties", icon: IconListDetails },
    { title: "News", url: "/dashboard/news", icon: IconChartBar },
    { title: "Publications", url: "/dashboard/publications", icon: IconFolder },
    { title: "Courses", url: "/dashboard/courses", icon: IconBook },
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
        <NavDocumentsWithHighlight items={documents} />
        <NavSecondaryWithHighlight items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}