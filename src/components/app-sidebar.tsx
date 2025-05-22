'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { HomeIcon, DatabaseIcon, ShieldIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
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
        },
        {
          title: "Data",
          url: "/dashboard/data",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center pb-4">
        {/* App logo or brand */}
      </SidebarHeader>
      
      {/* The key changes are in this SidebarContent component */}      <SidebarContent className="mt-4 flex-grow flex flex-col justify-center gap-6">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.items[0].title} className="w-full">
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col items-center gap-4">
                {item.items.map((item) => {
                  // Check if current path matches this item's URL or if at dashboard root and item is Beranda
                  const isActive = 
                    pathname === item.url || 
                    (pathname === "/dashboard" && item.title === "Beranda") ||
                    (pathname.startsWith(item.url + "/"));
                  
                  return (
                    <SidebarMenuItem key={item.title} className="w-full mb-2">
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.title} // Shows tooltip when collapsed
                        className="flex justify-center"
                        size="lg" // Using larger size for better touch targets
                      >
                        <Link href={item.url} className="flex items-center justify-center sm:justify-start gap-3 w-full">
                          {/* Icon will stay visible and centered when collapsed */}
                          <span className="flex-shrink-0 flex items-center justify-center w-6">
                            {item.icon}
                          </span>
                          {/* Text will be hidden when collapsed */}
                          <span className="transition-opacity duration-200">
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
