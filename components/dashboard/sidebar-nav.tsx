"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSpeed01Icon,
  LegalDocument01Icon,
  FolderLibraryIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    label: "Dashboard",
    href: "/business/dashboard",
    icon: DashboardSpeed01Icon,
  },
  {
    label: "Forms",
    href: "/business/forms",
    icon: LegalDocument01Icon,
  },
  {
    label: "Documents",
    href: "/business/documents",
    icon: FolderLibraryIcon,
  },
  {
    label: "Settings",
    href: "/business/settings",
    icon: Settings01Icon,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
              <Link href={item.href}>
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
