'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { HomeIcon, DatabaseIcon, ShieldIcon, Menu } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      items: [
        {
          title: "Beranda",
          url: "/dashboard/beranda",
          icon: <HomeIcon className="size-5" />,
        },        {
          title: "Status",
          url: "/dashboard/status",
          icon: <DatabaseIcon className="size-5" />,
        },
        {
          title: "Sanksi",
          url: "/dashboard/sanksi",
          icon: <ShieldIcon className="size-5" />,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  useSidebar()
  
  return (
    <Sidebar collapsible="icon" {...props} className="bg-purple-100 text-purple-800">
      <SidebarContent className="flex flex-col h-full bg-purple-100">
        {/* Toggle button at the top */}
        <div className="py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild
                    className="w-full text-purple-800 hover:bg-purple-200"
                  >
                    <SidebarTrigger className="flex items-center gap-3 px-3 py-2 w-full justify-start text-purple-800 hover:bg-purple-200">
                      <Menu className="size-5" />
                      <span className="font-medium text-sm">Menu</span>
                    </SidebarTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Main navigation items centered vertically */}
        <div className="flex-1 flex items-center justify-center">
          {data.navMain.map((group) => (
            <SidebarGroup key={group.items[0].title}>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-4">
                  {group.items.map((item) => {
                    const isActive = 
                      pathname === item.url || 
                      (pathname === "/dashboard" && item.title === "Beranda") ||
                      (pathname.startsWith(item.url + "/"));
                    
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          tooltip={item.title}
                          className={`w-full text-purple-800 hover:bg-purple-200 ${isActive ? 'bg-purple-300' : ''}`}
                        >
                          <Link href={item.url} className="flex items-center gap-3 px-3 py-2 text-purple-800">
                            <span className="flex-shrink-0">
                              {item.icon}
                            </span>
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
