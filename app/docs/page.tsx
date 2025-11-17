"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsSidebar } from "@/components/analytics-sidebar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { IconRobotFace } from "@tabler/icons-react"

export default function Page() {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState<any[]>([])
  const [packingData, setPackingData] = useState<any[]>([])
  const [billOfLandingData, setBillOfLandingData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoices, packing, billOfLandings] = await Promise.all([
          fetch('/api/invoices').then(res => res.json()),
          fetch('/api/packing').then(res => res.json()),
          fetch('/api/bill-of-landings').then(res => res.json())
        ])
        setInvoiceData(Array.isArray(invoices) ? invoices.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [])
        setPackingData(Array.isArray(packing) ? packing.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [])
        setBillOfLandingData(Array.isArray(billOfLandings) ? billOfLandings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [])
        setLoading(false)
      } catch (err) {
        console.error('API Error:', err)
        setInvoiceData([])
        setPackingData([])
        setBillOfLandingData([])
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])



  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "14rem",
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
              Cortex Analyst
            </Button>
          </SiteHeader>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-6">
              </div>
              <DataTable data={invoiceData} packingData={packingData} billOfLandingData={billOfLandingData} loading={loading} />
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
