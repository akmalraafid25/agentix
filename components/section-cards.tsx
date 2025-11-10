"use client"

import { useState, useEffect } from "react"
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DocumentStats {
  totalInvoices: number
  totalPacking: number
  totalDocuments: number
  uniqueVendors: number
  invoiceGrowth: string
  packingGrowth: string
  vendorGrowth: string
  totalGrowth: string
}

export function SectionCards() {
  const [stats, setStats] = useState<DocumentStats>({
    totalInvoices: 0,
    totalPacking: 0,
    totalDocuments: 0,
    uniqueVendors: 0,
    invoiceGrowth: '+0.0%',
    packingGrowth: '+0.0%',
    vendorGrowth: '+0.0%',
    totalGrowth: '+0.0%'
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/document-stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch document stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getGrowthIcon = (growth: string) => {
    return growth.startsWith('+') ? <IconTrendingUp /> : <IconTrendingDown />
  }

  const getGrowthVariant = (growth: string) => {
    return growth.startsWith('+') ? 'outline' : 'destructive'
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card h-36">
        <CardHeader>
          <CardDescription className="text-md">Total Invoices</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
            {stats.totalInvoices.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={getGrowthVariant(stats.invoiceGrowth)}>
              {getGrowthIcon(stats.invoiceGrowth)}
              {stats.invoiceGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card h-36">
        <CardHeader>
          <CardDescription>Packing Lists</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
            {stats.totalPacking.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={getGrowthVariant(stats.packingGrowth)}>
              {getGrowthIcon(stats.packingGrowth)}
              {stats.packingGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card h-36">
        <CardHeader>
          <CardDescription>Unique Vendors</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
            {stats.uniqueVendors.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={getGrowthVariant(stats.vendorGrowth)}>
              {getGrowthIcon(stats.vendorGrowth)}
              {stats.vendorGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card h-36">
        <CardHeader>
          <CardDescription>Total Documents</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-5xl">
            {stats.totalDocuments.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant={getGrowthVariant(stats.totalGrowth)}>
              {getGrowthIcon(stats.totalGrowth)}
              {stats.totalGrowth}
            </Badge>
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  )
}
