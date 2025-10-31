"use client"

import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <a href={item.url}>
                <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url} className="hover:bg-gray-200 dark:hover:bg-gray-700 data-[active=true]:bg-gray-200 dark:data-[active=true]:bg-gray-700">
                {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
