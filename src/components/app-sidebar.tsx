"use client";
import {
  IconChartBar,
  IconDashboard,
  IconCreditCard,
  IconListDetails,
  IconSettings,
  IconNotification,
  IconHelp,
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
      title: "Starter Feature",
      url: "/dashboard/starter",
      icon: IconListDetails,
      badge: "Starter",
    },
    {
      title: "Growth Feature",
      url: "/dashboard/growth",
      icon: IconListDetails,
      badge: "Growth",
    },
    {
      title: "Scale Feature",
      url: "/dashboard/scale",
      icon: IconListDetails,
      badge: "Scale",
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
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
    {
      title: "Support",
      url: "/dashboard/support",
      icon: IconHelp,
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
