"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import React from "react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url?: string
  icon?: React.ElementType
  items?: {
    title: string
    url: string
    icon?: React.ElementType
  }[]
}

type NavMainProps = {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const pathname = usePathname()

  // Determine if a parent item is active:
  // It is active if its url matches OR one of its subitems matches.
  const isItemActive = (item: NavItem): boolean => {
    if (item.url === pathname) return true
    if (item.items && item.items.some((sub) => sub.url === pathname))
      return true
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = isItemActive(item)

          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                defaultOpen={active}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "flex items-center transition-colors",
                        active ? "dark:bg-blue-500 bg-primary-purple-200" : ""
                      )}
                      onClick={(e) => {
                        // Prevent collapsing if this parent item (or one of its subitems) is active
                        if (active) {
                          e.preventDefault()
                          e.stopPropagation()
                        }
                      }}
                    >
                      {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const subActive = subItem.url === pathname
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={subItem.url}
                                className={cn(
                                  "flex items-center transition-colors",
                                  subActive
                                    ? "dark:bg-blue-500 bg-primary-purple-200"
                                    : ""
                                )}
                              >
                                {subItem.icon && (
                                  <subItem.icon className="mr-2 h-5 w-5" />
                                )}
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          } else {
            // Simple item without children
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center transition-colors",
                      active ? "bg-primary" : ""
                    )}
                  >
                    {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
