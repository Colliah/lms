"use client";

import {
  BookMarked,
  BookOpen,
  BookText,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Mic,
  Pencil,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const mainNav = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

const learningNav = [
  {
    title: "Vocabulary",
    url: "/vocabulary",
    icon: BookOpen,
  },
  {
    title: "Grammar",
    url: "/grammar",
    icon: Pencil,
  },
  {
    title: "Reading",
    url: "/reading",
    icon: BookMarked,
  },
  {
    title: "Writing",
    url: "/writing",
    icon: FileText,
  },
  {
    title: "Speaking",
    url: "/speaking",
    icon: Mic,
  },
  {
    title: "AI Quiz",
    url: "/quiz",
    icon: Sparkles,
  },
];

const settingsNav = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-bold text-lg">English LMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Learning Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learningNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {settingsNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/docs")}
              >
                <Link href="/docs/introduction">
                  <BookText />
                  <span>Documentation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
