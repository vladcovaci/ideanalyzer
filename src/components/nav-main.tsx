"use client";

import type { Icon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    badge?: string;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.url && item.url !== "#" ? (
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={
                    item.url === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname?.startsWith(item.url)
                  }
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className="ml-auto rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-2 py-0.5 text-[10px] font-medium"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className="ml-auto rounded-full border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-2 py-0.5 text-[10px] font-medium"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
