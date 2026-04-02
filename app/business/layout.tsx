import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, Logout01Icon } from "@hugeicons/core-free-icons"

import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Logo */}
        <SidebarHeader>
          <Link
            href="/business/dashboard"
            className="flex items-center gap-2 px-2 py-1"
          >
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary">
              <span className="text-[10px] font-bold text-primary-foreground">
                AI
              </span>
            </div>
            <span className="truncate text-sm font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              ReplyGen
            </span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Nav */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarNav />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Business info */}
        <SidebarFooter>
          <SidebarSeparator />
          <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
              B
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium text-foreground">
                Business name
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                Active
              </p>
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main area */}
      <SidebarInset>
        {/* Navbar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <HugeiconsIcon
                icon={Logout01Icon}
                className="text-muted-foreground"
                strokeWidth={1.5}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <HugeiconsIcon
                icon={UserCircleIcon}
                className="text-muted-foreground"
                strokeWidth={1.5}
              />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}
