"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsSidebar } from "@/components/analytics-sidebar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { IconRobotFace } from "@tabler/icons-react"

import data from "./data.json"

export default function Page() {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <div className="flex flex-1">
        <SidebarInset className={`flex-1 transition-all duration-300 ${isAnalyticsOpen ? 'mr-96' : 'mr-0'}`}>
          <SiteHeader>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
              className="ml-auto"
            >
              <IconRobotFace className="h-4 w-4 mr-2" />
AI Analytics
            </Button>
          </SiteHeader>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </SidebarInset>
        <AnalyticsSidebar 
          isOpen={isAnalyticsOpen} 
          onClose={() => setIsAnalyticsOpen(false)} 
        />
      </div>
    </SidebarProvider>
  )
}
