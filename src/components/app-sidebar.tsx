"use client";
import {
  IconDashboard,
  IconCreditCard,
  IconSettings,
  IconNotification,
  IconMessageChatbot,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";

import { NavMain } from "@/components/nav-main";
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
import { Logo } from "./common/logo";

const navigationData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analyze Idea",
      url: "/dashboard/analyze",
      icon: IconMessageChatbot,
    },
  ],

  navSecondary: [
    {
      title: "Account",
      url: "/dashboard/account",
      icon: IconSettings,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: IconCreditCard,
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: IconNotification,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession();
  const sessionUser = session?.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="!py-8"
            >
              <a href="/dashboard">
                <Logo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: sessionUser?.name ?? null,
            email: sessionUser?.email ?? null,
            avatar: sessionUser?.image ?? null,
          }}
          isLoading={status === "loading"}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
