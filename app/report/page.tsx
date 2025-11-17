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
import { IconChevronDown, IconLayoutColumns, IconCheck, IconX, IconExclamationMark } from "@tabler/icons-react"
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { toast } from "sonner"

import { Textarea } from "@/components/ui/textarea"
import { ItemsMatchDialog } from "@/components/items-match-dialog"

const initialData = [
  {
    documentSet: "DOC-001",
    invoiceNo: "INV-2024-001",
    packingList: "PL-001",
    billOfLading: "BOL-001",
    vendor: "SoftwareOne Indonesia",
    quantity: 25,
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
    quantity: 40,
    amount: "2,750,000",
    exceptionDetails: "Amount mismatch",
    agentsAction: "Under review",
    erpMatch: "Partial",
    reviewStatus: "In Progress"
  }
]

export default function Page() {
  const [pendingReviewData, setPendingReviewData] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>({
    monthlyTrends: [],
    supplierDistribution: [],
    topSuppliers: []
  })


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoices, packing, monthlyTrends, supplierDistribution, topSuppliers] = await Promise.all([
          fetch('/api/invoices').then(res => res.json()),
          fetch('/api/packing').then(res => res.json()),
          fetch('/api/analytics?chart=monthly-trends').then(res => res.json()),
          fetch('/api/analytics?chart=supplier-distribution').then(res => res.json()),
          fetch('/api/analytics?chart=top-suppliers').then(res => res.json())
        ])
        
        setAnalyticsData({
          monthlyTrends,
          supplierDistribution,
          topSuppliers
        })
        
        const poGroups: Record<string, any> = {}
        
        // Group by purchase order number
        invoices.forEach((invoice: any) => {
          const po = invoice.purchase_order_no
          if (!poGroups[po]) poGroups[po] = { invoice: null, packing: null }
          poGroups[po].invoice = invoice
        })
        
        packing.forEach((pack: any) => {
          const po = pack.purchase_order_no
          if (!poGroups[po]) poGroups[po] = { invoice: null, packing: null }
          poGroups[po].packing = pack
        })
        
        const combinedData = Object.entries(poGroups).map(([po, group]: [string, any]) => {
          const hasInvoice = !!group.invoice
          const hasPacking = !!group.packing
          
          let exceptionDetails = 'Match'
          
          if (!hasInvoice && !hasPacking) {
            exceptionDetails = 'No Documents'
          } else if (!hasInvoice) {
            exceptionDetails = 'Missing Invoice'
          } else if (!hasPacking) {
            exceptionDetails = 'Missing Packing List'
          } else {
            // Check if items and quantities match between invoice and packing
            const invoiceItems = group.invoice.item_no || []
            const packingItems = group.packing.item_no || []
            const invoiceQty = group.invoice.quantity || []
            const packingQty = group.packing.quantity || []
            
            if (invoiceItems.length === 0 || packingItems.length === 0) {
              exceptionDetails = 'Missing Items Data'
            } else {
              const matchingItems = invoiceItems.filter((item: string) => 
                packingItems.includes(item)
              )
              
              if (matchingItems.length === invoiceItems.length && matchingItems.length === packingItems.length) {
                // Check quantities for matching items
                let qtyMismatch = false
                for (let i = 0; i < invoiceItems.length; i++) {
                  const packingIndex = packingItems.findIndex((item: string) => item === invoiceItems[i])
                  if (packingIndex >= 0 && Number(invoiceQty[i]) !== Number(packingQty[packingIndex])) {
                    qtyMismatch = true
                    break
                  }
                }
                exceptionDetails = qtyMismatch ? 'Quantity Mismatch' : 'Match'
              } else if (matchingItems.length > 0) {
                exceptionDetails = 'Partial Match'
              } else {
                exceptionDetails = 'Item Code Mismatch'
              }
            }
          }
          
          // Calculate total quantity from packing list or invoice
          const totalQuantity = group.packing?.quantity?.reduce((sum: number, qty: string) => sum + Number(qty || 0), 0) || 
                               group.invoice?.quantity?.reduce((sum: number, qty: string) => sum + Number(qty || 0), 0) || 0
          
          return {
            documentSet: `DOC-${po}`,
            invoiceNo: group.invoice?.invoice_no || '',
            invoiceFilename: group.invoice?.source || '',
            packingList: group.packing?.source || '',
            billOfLading: '',
            vendor: group.invoice?.vendor_name || group.packing?.vendor_name || '',
            quantity: totalQuantity,
            amount: group.invoice?.total_amount || '0',
            exceptionDetails,
            agentsAction: 'Pending verification',
            erpMatch: 'No Issues',
            reviewStatus: 'Pending'
          }
        })
        
        // Show all documents, not just exceptions
        setPendingReviewData(combinedData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setPendingReviewData(initialData)
      } finally {
        // Data loaded
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState('')
  const [actionData, setActionData] = useState<any>({ type: 'buyer_notify', subject: '', body: '' })
  
  const updateReviewStatus = async (documentSet: string, newStatus: string) => {
    setPendingReviewData(prev => 
      prev.map(item => 
        item.documentSet === documentSet 
          ? { ...item, reviewStatus: newStatus }
          : item
      )
    )
  }
  
  const templates = {
    buyer_notify: {
      subject: 'Document Review Required',
      body: (documentSet: string, invoiceNo: string, packingList: string) => 
        `Dear Buyer,\n\nPlease review the following document set for processing:\n\n` +
        `Document Set: ${documentSet}\n` +
        `Invoice Number: ${invoiceNo}\n` +
        `Packing List: ${packingList}\n\n` +
        `Your attention is required to proceed with the order.\n\n` +
        `Best regards,\nSystem`
    },
    vendor_response: {
      subject: 'Vendor Response Required',
      body: (documentSet: string, invoiceNo: string, packingList: string) => 
        `Dear Vendor,\n\nWe require additional information for the following document set:\n\n` +
        `Document Set: ${documentSet}\n` +
        `Invoice Number: ${invoiceNo}\n` +
        `Packing List: ${packingList}\n\n` +
        `Please provide the missing details at your earliest convenience.\n\n` +
        `Best regards,\nProcurement Team`
    },
    po_amendment: {
      subject: 'PO Amendment Request',
      body: (documentSet: string, invoiceNo: string, packingList: string) => 
        `Dear Team,\n\nPurchase order amendment is required for the following document set:\n\n` +
        `Document Set: ${documentSet}\n` +
        `Invoice Number: ${invoiceNo}\n` +
        `Packing List: ${packingList}\n\n` +
        `Please review and approve the changes.\n\n` +
        `Best regards,\nProcurement Team`
    }
  }
  
  const handleAIAction = (documentSet: string, invoiceFilename?: string, packingList?: string) => {
    setSelectedDocument(documentSet)
    setActionData({
      type: 'buyer_notify',
      subject: templates.buyer_notify.subject,
      body: templates.buyer_notify.body(documentSet, invoiceFilename || '', packingList || ''),
      invoiceFilename: invoiceFilename || '',
      packingList: packingList || ''
    })
    setSidebarOpen(true)
  }
  
  const updateActionType = (actionType: string) => {
    const template = templates[actionType as keyof typeof templates]
    setActionData((prev: any) => ({
      ...prev,
      type: actionType,
      subject: template.subject,
      body: template.body(selectedDocument, prev.invoiceNo, prev.packingList)
    }))
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
        <SidebarInset className="flex-1">
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
                      <SelectItem value="analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                  <TabsList className="hidden @4xl/main:flex">
                    <TabsTrigger value="pending-review">
                      Pending Review <Badge variant="secondary">{pendingReviewData.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                          <TableHead>Cartons</TableHead>
                          <TableHead>Amount (IDR)</TableHead>
                          <TableHead>Exception Details</TableHead>
                          <TableHead>Agent&apos;s Action</TableHead>
                          <TableHead>ERP Match</TableHead>
                          <TableHead>Review Status</TableHead>
                          <TableHead>Actions</TableHead>
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
                            <TableCell className="text-center">{item.quantity || 0}</TableCell>
                            <TableCell className="text-right">IDR {item.amount}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.exceptionDetails === "Match" ? "default" : "outline"}
                                className={`flex items-center gap-1 ${
                                  item.exceptionDetails === "Match" ? "bg-green-100 text-green-800 border-green-300" :
                                  item.exceptionDetails === "Partial Match" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                                  item.exceptionDetails === "Mismatch" ? "bg-red-100 text-red-800 border-red-300" : ""
                                }`}
                              >
                                {item.exceptionDetails === "Match" && <IconCheck className="h-3 w-3" />}
                                {item.exceptionDetails === "Partial Match" && <IconExclamationMark className="h-3 w-3" />}
                                {item.exceptionDetails === "Mismatch" && <IconX className="h-3 w-3" />}
                                {item.exceptionDetails || "Mismatch"}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.agentsAction}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={item.erpMatch === "Matched" ? "default" : "secondary"} 
                                className={`flex items-center gap-1 ${item.erpMatch === "Partial" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}`}
                              >
                                {item.erpMatch === "Matched" && <IconCheck className="h-3 w-3" />}
                                {item.erpMatch === "Partial" && <IconExclamationMark className="h-3 w-3" />}
                                {item.erpMatch === "Not Matched" && <IconX className="h-3 w-3" />}
                                {item.erpMatch}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select value={item.reviewStatus} onValueChange={(value) => updateReviewStatus(item.documentSet, value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Approved">Approved</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <ItemsMatchDialog documentSet={item.documentSet} />
                                <Button variant="outline" size="sm" onClick={() => handleAIAction(item.documentSet, item.invoiceFilename, item.packingList)}>
                                  AI Actions
                                </Button>
                              </div>
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Generated Reports</h2>
                    <Button variant="outline" size="sm">Export Table</Button>
                  </div>
                  <div className="overflow-hidden rounded-lg border">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead>Report Type</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Monthly Invoice Summary</TableCell>
                          <TableCell>Acme Manufacturing</TableCell>
                          <TableCell>245</TableCell>
                          <TableCell>$28.5M</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-green-500 rounded"></div>100%</div></TableCell>
                          <TableCell>2024-03-20 14:30</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Supplier Performance Report</TableCell>
                          <TableCell>Global Tech Solutions</TableCell>
                          <TableCell>189</TableCell>
                          <TableCell>$19.5M</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-green-500 rounded"></div>100%</div></TableCell>
                          <TableCell>2024-03-20 13:45</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Document Matching Analysis</TableCell>
                          <TableCell>Prime Industries</TableCell>
                          <TableCell>156</TableCell>
                          <TableCell>$16.5M</TableCell>
                          <TableCell><Badge className="bg-blue-100 text-blue-800">Processing</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-blue-500 rounded" style={{width: '60%'}}></div>94.8%</div></TableCell>
                          <TableCell>2024-03-20 15:20</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ERP Integration Summary</TableCell>
                          <TableCell>Stellar Logistics</TableCell>
                          <TableCell>134</TableCell>
                          <TableCell>$12.5M</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-green-500 rounded"></div>100%</div></TableCell>
                          <TableCell>2024-03-20 12:15</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Compliance Audit Report</TableCell>
                          <TableCell>Nexus Corp</TableCell>
                          <TableCell>98</TableCell>
                          <TableCell>$14.8M</TableCell>
                          <TableCell><Badge className="bg-green-100 text-green-800">Completed</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-2"><div className="w-16 h-2 bg-green-500 rounded"></div>100%</div></TableCell>
                          <TableCell>2024-03-20 11:30</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-6">
                      <h3 className="text-lg font-semibold mb-4">Monthly Document Trend</h3>
                      <ChartContainer config={{}} className="h-[300px]">
                        <LineChart data={analyticsData.monthlyTrends}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Line type="monotone" dataKey="invoices" stroke="#3b82f6" strokeWidth={2} name="Invoices" />
                          <Line type="monotone" dataKey="packingLists" stroke="#10b981" strokeWidth={2} name="Packing Lists" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                      </ChartContainer>
                    </div>
                    
                    <div className="rounded-lg border p-6">
                      <h3 className="text-lg font-semibold mb-4">Supplier Distribution</h3>
                      <div className="flex items-center gap-4 mb-4">
                        {(analyticsData.supplierDistribution || []).slice(0, 4).map((supplier: any, index: number) => {
                          const colors = ['bg-blue-500', 'bg-cyan-500', 'bg-orange-500', 'bg-purple-500']
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${colors[index]}`}></div>
                              <span className="text-sm">{supplier.NAME || supplier.name || 'Unknown'}</span>
                            </div>
                          )
                        })}
                      </div>
                      <ChartContainer config={{}} className="h-[250px]">
                        <PieChart>
                          <Pie 
                            data={(analyticsData.supplierDistribution || []).map((item: any) => ({
                              name: item.NAME || item.name || 'Unknown',
                              value: item.VALUE || item.value || 0
                            }))}
                            cx="50%" 
                            cy="50%" 
                            outerRadius={80} 
                            dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#06b6d4" />
                            <Cell fill="#f97316" />
                            <Cell fill="#a855f7" />
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-6">
                      <h3 className="text-lg font-semibold mb-4">Processing Accuracy</h3>
                      <div className="flex items-center justify-center h-[200px]">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-gray-300" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-blue-600" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="96.1, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold">96.1%</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">Overall System Accuracy</p>
                    </div>
                    
                    <div className="rounded-lg border p-6">
                      <h3 className="text-lg font-semibold mb-4">Top Performing Suppliers</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.topSuppliers}>
                            <XAxis dataKey="supplier" fontSize={10} />
                            <YAxis domain={[90, 100]} />
                            <Bar dataKey="score" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        </SidebarInset>
        
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-[500px] bg-background border-l shadow-lg z-50 p-4 space-y-4 transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI Actions - {selectedDocument}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>×</Button>
            </div>
            <div>
              <Label className="py-2">Action Type</Label>
              <Select value={actionData.type} onValueChange={updateActionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer_notify">Buyer Notify</SelectItem>
                  <SelectItem value="vendor_response">Vendor Response</SelectItem>
                  <SelectItem value="po_amendment">PO Amendment Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="py-2">Email Subject</Label>
              <div className="p-2 bg-muted rounded">{actionData.subject}</div>
            </div>
            <div>
              <Label className="py-2">Email Body</Label>
              <Textarea value={actionData.body} readOnly rows={8} />
            </div>
            <Button className="w-full" onClick={async () => {
              try {
                const response = await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: actionData.subject,
                    body: actionData.body,
                    documentSet: selectedDocument,
                    invoiceFilename: actionData.invoiceFilename,
                    packingList: actionData.packingList,
                    action: actionData.type
                  })
                })
                if (response.ok) {
                  setSidebarOpen(false)
                  toast.success('Email sent successfully!')
                } else {
                  toast.error('Failed to send email')
                }
              } catch {
                toast.error('Error sending email')
              }
            }}>
              Send Email
            </Button>
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  )
}