"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { IconChevronDown, IconLayoutColumns } from "@tabler/icons-react"

const pendingReviewData = [
  {
    documentSet: "DOC-001",
    invoiceNo: "INV-2024-001",
    packingList: "PL-001",
    billOfLading: "BOL-001",
    vendor: "SoftwareOne Indonesia",
    amount: "1,500,000",
    exceptionDetails: "Missing signature",
    agentsAction: "Pending verification",
    erpMatch: "Matched",
    reviewStatus: "Pending"
  },
  {
    documentSet: "DOC-002",
    invoiceNo: "INV-2024-002",
    packingList: "PL-002",
    billOfLading: "BOL-002",
    vendor: "Tech Solutions",
    amount: "2,750,000",
    exceptionDetails: "Amount mismatch",
    agentsAction: "Under review",
    erpMatch: "Partial",
    reviewStatus: "In Progress"
  }
]

export default function Page() {
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
              <Tabs defaultValue="pending-review" className="w-full flex-col justify-start gap-6">
                <div className="flex items-center justify-between px-4 lg:px-6">
                  <Label htmlFor="view-selector" className="sr-only">
                    View
                  </Label>
                  <Select defaultValue="pending-review">
                    <SelectTrigger
                      className="flex w-fit @4xl/main:hidden"
                      size="sm"
                      id="view-selector"
                    >
                      <SelectValue placeholder="Select a view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending-review">Pending Review</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                    </SelectContent>
                  </Select>
                  <TabsList className="hidden @4xl/main:flex">
                    <TabsTrigger value="pending-review">
                      Pending Review <Badge variant="secondary">{pendingReviewData.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <IconLayoutColumns />
                        <span className="hidden lg:inline">Customize Columns</span>
                        <span className="lg:hidden">Columns</span>
                        <IconChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuCheckboxItem checked>Document Set</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked>Invoice No</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked>Vendor</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked>Amount</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <TabsContent value="pending-review" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader className="bg-muted sticky top-0 z-10">
                        <TableRow>
                          <TableHead>Document Set</TableHead>
                          <TableHead>Invoice No</TableHead>
                          <TableHead>Packing List</TableHead>
                          <TableHead>Bill of Lading</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Amount (IDR)</TableHead>
                          <TableHead>Exception Details</TableHead>
                          <TableHead>Agent's Action</TableHead>
                          <TableHead>ERP Match</TableHead>
                          <TableHead>Review Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingReviewData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.documentSet}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.invoiceNo}</Badge>
                            </TableCell>
                            <TableCell>{item.packingList}</TableCell>
                            <TableCell>{item.billOfLading}</TableCell>
                            <TableCell>{item.vendor}</TableCell>
                            <TableCell className="text-right">IDR {item.amount}</TableCell>
                            <TableCell>{item.exceptionDetails}</TableCell>
                            <TableCell>{item.agentsAction}</TableCell>
                            <TableCell>
                              <Badge variant={item.erpMatch === "Matched" ? "default" : "secondary"}>
                                {item.erpMatch}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.reviewStatus === "Pending" ? "destructive" : "secondary"}>
                                {item.reviewStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Total Documents</h3>
                      <p className="text-2xl font-bold">{pendingReviewData.length}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Pending Review</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {pendingReviewData.filter(item => item.reviewStatus === "Pending").length}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">In Progress</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {pendingReviewData.filter(item => item.reviewStatus === "In Progress").length}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <h3 className="font-semibold">Total Amount</h3>
                      <p className="text-2xl font-bold">IDR 4,250,000</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}