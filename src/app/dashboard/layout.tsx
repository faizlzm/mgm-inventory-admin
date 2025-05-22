'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const pageTitles: Record<string, string> = {
  '/dashboard': 'Beranda',
  '/dashboard/beranda': 'Beranda',
  '/dashboard/data': 'Data Management',
  '/dashboard/sanksi': 'Sanksi Management',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Get page title from mapping or generate from path
  const getPageTitle = () => {
    if (pageTitles[pathname]) {
      return pageTitles[pathname]
    }
    
    const segments = pathname.split('/')
    const currentSection = segments[segments.length - 1]
    
    // Capitalize the first letter
    return currentSection.charAt(0).toUpperCase() + currentSection.slice(1)
  }
  
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex flex-col shrink-0 border-b">
          <div className="flex h-16 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">{getPageTitle()}</h1>
          </div>
          <div className="pb-2 px-4">
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
