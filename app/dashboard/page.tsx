"use client"

import { useState, useEffect } from "react"
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

export default function Page() {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState([])
  const [packingData, setPackingData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      console.log('Polling for new data...')
      const [invoices, packing] = await Promise.all([
        fetch('/api/invoices').then(res => res.json()),
        fetch('/api/packing').then(res => res.json())
      ])
      
      const newInvoices = Array.isArray(invoices) ? invoices : []
      const newPacking = Array.isArray(packing) ? packing : []
      
      // Only update if data has changed
      setInvoiceData(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newInvoices)) {
          console.log('Invoice data updated:', newInvoices.length, 'items')
          return newInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        return prev
      })
      
      setPackingData(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newPacking)) {
          console.log('Packing data updated:', newPacking.length, 'items')
          return newPacking.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        }
        return prev
      })
    } catch (err) {
      console.error('API Error:', err)
      setInvoiceData([])
      setPackingData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Set up polling every 3 seconds to check for new data
    const interval = setInterval(() => {
      setLoading(false) // Don't show loading on polling updates
      fetchData()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const handleTabChange = (tab: string) => {
    // Tab change will use the already polling data
    // No need to manually fetch again
  }

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
                <DataTable data={invoiceData} packingData={packingData} loading={loading} onTabChange={handleTabChange} />
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
