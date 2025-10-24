"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { IconEdit, IconTrash } from "@tabler/icons-react"

interface Invoice {
  id: string
  source: string
  invoiceNo: string
  vendorName: string
  purchaseOrderNo: string
  itemNo: string
  quantity: number
  price: number
  currency: string
  createdAt: string
}

const mockData: Invoice[] = [
  {
    id: "1",
    source: "invoice_001.pdf",
    invoiceNo: "INV-2024-001",
    vendorName: "ABC Corp",
    purchaseOrderNo: "PO-2024-001",
    itemNo: "ITEM-001",
    quantity: 10,
    price: 100.00,
    currency: "USD",
    createdAt: "2024-01-15"
  }
]

export function InvoiceTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Source</TableHead>
          <TableHead>Invoice No.</TableHead>
          <TableHead>Vendor Name</TableHead>
          <TableHead>Purchase Order No.</TableHead>
          <TableHead>Item No.</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mockData.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.source}</TableCell>
            <TableCell>{invoice.invoiceNo}</TableCell>
            <TableCell>{invoice.vendorName}</TableCell>
            <TableCell>{invoice.purchaseOrderNo}</TableCell>
            <TableCell>{invoice.itemNo}</TableCell>
            <TableCell>{invoice.quantity}</TableCell>
            <TableCell>${invoice.price.toFixed(2)}</TableCell>
            <TableCell>{invoice.currency}</TableCell>
            <TableCell>{invoice.createdAt}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <IconEdit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}