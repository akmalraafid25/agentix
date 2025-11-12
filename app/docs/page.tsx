"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function Page() {
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
      <SidebarInset>
        <SiteHeader />
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
    </SidebarProvider>
  )
}
