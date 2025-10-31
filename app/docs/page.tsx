"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react"

export default function Page() {
  const [invoiceData, setInvoiceData] = useState([])
  const [packingData, setPackingData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoices, packing] = await Promise.all([
          fetch('/api/invoices').then(res => res.json()),
          fetch('/api/packing').then(res => res.json())
        ])
        setInvoiceData(Array.isArray(invoices) ? invoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [])
        setPackingData(Array.isArray(packing) ? packing.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) : [])
        setLoading(false)
      } catch (err) {
        console.error('API Error:', err)
        setInvoiceData([])
        setPackingData([])
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
              <DataTable data={invoiceData} packingData={packingData} loading={loading} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
