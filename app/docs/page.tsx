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
    Promise.all([
      fetch('/api/invoices').then(res => res.json()),
      fetch('/api/packing').then(res => res.json())
    ])
      .then(([invoices, packing]) => {
        setInvoiceData(Array.isArray(invoices) ? invoices : [])
        setPackingData(Array.isArray(packing) ? packing : [])
      })
      .catch(err => {
        console.error('API Error:', err)
        setInvoiceData([])
        setPackingData([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

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
