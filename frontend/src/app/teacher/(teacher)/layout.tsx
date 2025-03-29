"use client"

import TeacherSidebar from "@/components/TeacherSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col">
          <SidebarTrigger />
          <main className="p-4 flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
